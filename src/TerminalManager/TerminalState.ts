import { Map as IMap, List } from 'immutable';
import { CardState } from './CardState';
import * as debug from 'debug';
import * as shortid from 'shortid';
import ConfigManager from '../ConfigManager';
import { ICardTag, CardRecord, ActionRecord } from '../models';
import CardManager from '../CardManager';
import { cardOperations } from '../CardOperations';

const log = debug('card-manager');

export class TerminalState {
    public user: string;

    private openCards: IMap<string, CardState>;
    private terminaId: string;

    constructor(user: string, terminalId: string) {
        log('creating terminal state', user, terminalId);
        this.user = user;
        this.terminaId = terminalId;
        this.openCards = IMap<string, CardState>();
    }

    get terminalId() { return this.terminaId; }
    set terminalId(id: string) { this.terminaId = id; }

    public getOpenCardId() {
        if (this.openCards.count() === 1) {
            const cs = this.openCards.first() as CardState;
            return cs.card.id;
        }
        return '';
    }

    public getOpenCardIds() {
        return this.openCards.keySeq().toArray();
    }

    public isCardOpen(cardId: string) {
        return this.openCards.has(cardId);
    }

    public assignedToUser(user: string): boolean {
        return this.user === user;
    }

    public assignedToTerminal(terminalId: string): boolean {
        return this.terminaId === terminalId;
    }

    public openCard(cardId: string): CardRecord {
        if (!this.isCardOpen(cardId)) {
            if (CardManager.hasCard(cardId)) {
                const card = CardManager.getCardById(cardId) as CardRecord;
                this.openCards = this.openCards.set(card.id, new CardState(card));
            }
        }
        const cardState = this.openCards.get(cardId);
        if (cardState) {
            return cardState.card;
        }
        throw new Error(`Card [${cardId}] not found.`);
    }

    public closeCard(cardId: string) {
        const commit = this.createCommitData(cardId);
        if (commit) {
            CardManager.postCommits([commit]);
        }
        this.deleteCard(cardId);
    }

    public deleteCard(cardId: string) {
        if (this.openCards.has(cardId)) {
            this.openCards = this.openCards.delete(cardId);
        }
    }

    public removePendingActions(cardId: string, subCardId: string): CardRecord {
        const cardState = this.openCards.get(cardId);
        if (cardState) {
            cardState.removePendingActionsForCard(subCardId);
            return cardState.card;
        } else {
            throw new Error(`Card [${cardId}] is not opened`);
        }
    }

    public getPendingActions(cardId: string): List<ActionRecord> {
        const cardState = this.openCards.get(cardId);
        if (cardState) {
            return cardState.pendingActions;
        } else {
            throw new Error(`Card [${cardId}] is not opened`);
        }
    }

    public hasPendingActions(cardId: string, subCardId: string) {
        const cardState = this.openCards.get(cardId);
        if (cardState) {
            return cardState.hasPendingActions(subCardId);
        } else {
            throw new Error(`Card [${cardId}] is not opened`);
        }
    }

    public createCommitData(cardId: string): any {
        const cardState = this.openCards.get(cardId);
        if (!cardState) { return null; }

        const finalActions = cardState
            .pendingActions
            .filter(x => x.actionType !== 'COMMIT_CARD')
            .map(a => cardOperations.processPendingAction(a));

        if (finalActions.count() === 0) {
            return null;
        }

        if (!cardState) { return null; }

        cardState.clearPendingActions();

        return {
            id: shortid.generate(),
            time: new Date().getTime(),
            terminalId: this.terminaId,
            user: this.user,
            cardId: cardState.card.id,
            state: cardState.cardAsJs(),
            actions: finalActions.toJS()
        };
    }

    public async createCard(cardType: string, tags: ICardTag[],
        canEditAction?: (action: ActionRecord) => boolean,
        editAction?: (action: ActionRecord) => Promise<ActionRecord>,
        closeHandler?: () => void) {
        const ct = ConfigManager.getCardTypeByRef(cardType);
        if (ct) {
            const cardState = new CardState(new CardRecord());
            const cardId = shortid.generate();
            this.openCards = this.openCards.set(cardId, cardState);
            const cardCreateAction = new ActionRecord({
                actionType: 'CREATE_CARD',
                id: shortid.generate(),
                data: {
                    id: cardId,
                    typeId: ct.id,
                    type: ct.name,
                    time: new Date().getTime()
                }
            });
            const actions = [cardCreateAction];
            for (const tag of tags) {
                const actionData = new ActionRecord({
                    id: shortid.generate(),
                    cardId,
                    actionType: 'SET_CARD_TAG',
                    data: { name: tag.name, value: tag.value, typeId: tag.typeId }
                });
                actions.push(actionData);
            }
            return this.executeActions(cardState, actions, canEditAction, editAction, closeHandler);
        }
        throw new Error(`Card Type [${cardType}] not found.`);
    }

    public async executeAction(
        cardId: string, actionCardId: string, type: string, data: any,
        canEditAction?: (action: ActionRecord) => boolean,
        editAction?: (action: ActionRecord) => Promise<ActionRecord>,
        closeHandler?: () => void
    ) {
        const cardState = this.openCards.get(cardId);
        if (cardState) {
            const action = new ActionRecord({
                id: shortid.generate(),
                cardId: actionCardId || cardId,
                actionType: type,
                data
            });
            return this.executeActions(cardState, [action], canEditAction, editAction, closeHandler);
        } else {
            throw new Error(`Card [${cardId}] is not opened`);
        }
    }

    private async executeActions(
        cardState: CardState, actions: ActionRecord[],
        canEditAction?: (action: ActionRecord) => boolean,
        editAction?: (action: ActionRecord) => Promise<ActionRecord>,
        closeHandler?: () => void
    ) {
        let result = new CardRecord();
        for (const action of actions) {
            result = await cardState.mutate(action, canEditAction, editAction);
        }
        if (cardState.pendingActions.some(x => x.actionType === 'COMMIT_CARD')) {
            this.closeCard(result.id);
            if (closeHandler) { closeHandler(); }
        } else {
            const cancelCardAction = cardState.pendingActions.find(x => x.actionType === 'CANCEL_CARD_ACTIONS');
            if (cancelCardAction) {
                const subCardId = (cancelCardAction.cardId) || result.id;
                const rc = this.removePendingActions(result.id, subCardId);
                if (result.id === subCardId) {
                    this.deleteCard(result.id);
                    if (closeHandler) { closeHandler(); }
                } else if (rc) {
                    result = rc;
                }
            }
        }
        return result;
    }
}