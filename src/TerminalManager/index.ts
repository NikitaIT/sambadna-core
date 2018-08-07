import { Map as IMap, List } from 'immutable';
import { CardRecord, ActionRecord, ICardTag } from '../models';
import * as debug from 'debug';
import { TerminalState } from './TerminalState';

const log = debug('card-manager');

export class TerminalManager {
    private activeTerminals: IMap<string, TerminalState>;

    constructor() {
        this.activeTerminals = IMap<string, TerminalState>();
    }

    public enableTerminal(terminalId: string, user: string) {
        log('enable terminal request.', terminalId, user);
        if (this.userHaveOtherActiveTerminal(user, terminalId)) {
            log('user have other active terminal');
            this.changeUserTerminal(user, terminalId);
        }
        if (this.terminalIsEnabledByAnotherUser(terminalId, user)) {
            log('terminal is enabled by another user');
            this.changeTerminalUser(terminalId, user);
        }
        if (!this.terminalIsEnabled(terminalId)) {
            this.activeTerminals =
                this.activeTerminals.set(terminalId, new TerminalState(user, terminalId));
        }
    }

    public openCard(terminalId: string, cardId: string): CardRecord {
        log('open card requested', terminalId, cardId);
        const terminal = this.getTerminal(terminalId);
        return terminal.openCard(cardId);
    }

    public async createCard(terminalId: string, cardType: string, tags: ICardTag[],
        canEditHandler?: (action: ActionRecord) => boolean,
        editHandler?: (action: ActionRecord) => Promise<ActionRecord>,
        closeHandler?: () => void
    ) {
        log('create card requested', terminalId);
        const terminal = this.getTerminal(terminalId);
        return terminal.createCard(cardType, tags, canEditHandler, editHandler, closeHandler);
    }

    public async closeCard(terminalId: string, cardId: string) {
        log(`${cardId} closing.`);
        const terminal = this.getTerminal(terminalId);
        cardId = this.getCardId(cardId, terminal);
        const result = await terminal.executeAction(cardId, cardId, 'COMMIT_CARD', { id: 1 });
        terminal.closeCard(cardId);
        return result;
    }

    // public cancelCard(terminalId: string, cardId: string) {
    //     log(`${cardId} canceling.`);
    //     const terminal = this.getTerminal(terminalId);
    //     cardId = this.getCardId(cardId, terminal);
    //     terminal.deleteCard(cardId);
    // }

    public async executeAction(
        terminalId: string, cardId: string, actionCardId: string, type: string, data: any,
        canEditHandler?: (action: ActionRecord) => boolean,
        editHandler?: (action: ActionRecord) => Promise<ActionRecord>,
        closeHandler?: () => void
    ) {
        log('execute action', terminalId, cardId, actionCardId);
        const terminal = this.getTerminal(terminalId);
        cardId = this.getCardId(cardId, terminal);
        return terminal.executeAction(cardId, actionCardId, type, data, canEditHandler, editHandler, closeHandler);
    }

    public removePendingActions(terminalId: string, cardId: string, subCardId: string): CardRecord | undefined {
        log('remove pending actions', terminalId, cardId);
        const terminal = this.getTerminal(terminalId);
        cardId = this.getCardId(cardId, terminal);
        return terminal.removePendingActions(cardId, subCardId);
    }

    public getPendingActions(terminalId: string, cardId: string) {
        try {
            const terminal = this.getTerminal(terminalId);
            cardId = this.getCardId(cardId, terminal);
            return terminal.getPendingActions(cardId);
        } catch (error) {
            return List<ActionRecord>();
        }
    }

    public hasPendingActions(terminalId: string, cardId: string, subCardId: string) {
        try {
            const terminal = this.getTerminal(terminalId);
            cardId = this.getCardId(cardId, terminal);
            return terminal.hasPendingActions(cardId, subCardId);
        } catch (error) {
            return false;
        }
    }

    public async executeCommand(terminalId: string, cardId: string, name: string, data: any) {
        return this.executeAction(terminalId, cardId, cardId, 'EXECUTE_COMMAND', { name, params: data });
    }

    private userHaveOtherActiveTerminal(user: string, terminalId: string): boolean {
        return this.activeTerminals.some(t => t.assignedToUser(user) && !t.assignedToTerminal(terminalId));
    }

    private terminalIsEnabled(terminalId: string): boolean {
        return this.activeTerminals.has(terminalId);
    }

    private terminalIsEnabledByAnotherUser(terminalId: string, user: string): boolean {
        const terminal = this.activeTerminals.get(terminalId);
        return Boolean(terminal && !terminal.assignedToUser(user));
    }

    private changeUserTerminal(user: string, terminalId: string) {
        const terminalState = this.activeTerminals.find(x => x.assignedToUser(user));
        if (terminalState && !terminalState.assignedToTerminal(terminalId)) {
            const currentTerminalID = terminalState.terminalId;
            terminalState.terminalId = terminalId;
            this.activeTerminals =
                this.activeTerminals
                    .delete(currentTerminalID)
                    .set(terminalId, terminalState);
        }
    }

    private changeTerminalUser(terminalId: string, user: string) {
        const terminalState = this.activeTerminals.find(x => x.assignedToTerminal(terminalId));
        if (terminalState && !terminalState.assignedToUser(user)) {
            terminalState.user = user;
        }
    }

    private getTerminal(terminalId: string) {
        let result = this.activeTerminals.get(terminalId);
        if (!terminalId) {
            if (this.activeTerminals.count() === 1) {
                result = (this.activeTerminals.first() as TerminalState);
            } else { throw new Error('You need to set terminal id when multiple terminals are registered.'); }
        }
        if (!result) {
            throw new Error(`Terminal [${terminalId}] is not found.`);
        }
        return result;
    }

    private getCardId(cardId: string, terminal: TerminalState) {
        if (!cardId) {
            cardId = terminal.getOpenCardId();
            if (!cardId) {
                throw new Error(`You need to set the cardId when there are multiple open cards. ${terminal.getOpenCardIds()}`);
            }
        }
        return cardId;
    }
}

export default new TerminalManager();