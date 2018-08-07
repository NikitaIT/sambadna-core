import { List } from 'immutable';
import { ActionRecord, CardRecord } from "../models";
import RuleManager from '../RuleManager';
import CardManager from '../CardManager';
import * as debug from 'debug';

const log = debug('card-manager');

export class CardState {

    public pendingActions: List<ActionRecord>;
    private originalCard: CardRecord;
    private resultCard: CardRecord;

    constructor(card: CardRecord) {
        this.originalCard = card;
        this.resultCard = card;
        this.clearPendingActions();
    }

    get card() { return this.resultCard; }

    public clearPendingActions() {
        this.pendingActions = List<ActionRecord>();
    }

    public hasPendingActions(cardId: string) {
        return this.pendingActions.some(a => a.cardId === cardId);
    }

    public cardAsJs() {
        return this.originalCard.toJS();
    }

    public async getNextActions(
        action: ActionRecord,
        canEditAction?: (action: ActionRecord) => boolean,
        editAction?: (action: ActionRecord) => Promise<ActionRecord>
    ) {
        const result: ActionRecord[] = [];
        const root = this.card;
        const cardId = action.actionType === 'CREATE_CARD' ? action.data.id : action.cardId;
        const card = root.getCard(cardId) || root;
        const actions = await RuleManager.getNextActions(
            action.actionType, action.data, cardId, card, root);
        for (let ac of actions) {
            if (canEditAction && editAction && canEditAction(ac)) {
                try {
                    ac = await editAction(ac);
                } catch (error) {
                    return [];
                }
            }
            result.push(ac);
        }
        return result;
    }

    public async addPendingAction(
        action: ActionRecord,
        canEditAction?: (action: ActionRecord) => boolean,
        editAction?: (action: ActionRecord) => Promise<ActionRecord>
    ) {
        const card = this.card.getCard(action.cardId) || this.card;
        if (CardManager.canApplyAction(card, action)) {
            action = action.set('data', this.clearUnusedProps(action.data));
            this.pendingActions = this.pendingActions.push(action);
            this.resultCard = CardManager.applyAction(this.resultCard, action, false);
            const nextActions = await this.getNextActions(action, canEditAction, editAction);
            for (const nextAction of nextActions) {
                await this.addPendingAction(nextAction, canEditAction, editAction);
            }
        } else {
            log('Cant apply action', this.card, action);
        }
    }

    public removePendingActionsForCard(cardId: string) {
        this.pendingActions = this.pendingActions.filter(a => !a.relatesToCard(cardId));
        if (this.pendingActions.count() === 0) {
            this.resultCard = this.originalCard;
        } else {
            this.resultCard = this.pendingActions.reduce(
                (r, a) => CardManager.applyAction(r, a, false), this.originalCard
            );
        }
    }

    public async mutate(
        action: ActionRecord,
        canEditAction?: (action: ActionRecord) => boolean,
        editAction?: (action: ActionRecord) => Promise<ActionRecord>
    ) {
        await this.addPendingAction(action, canEditAction, editAction);
        this.resultCard = this.pendingActions.reduce(
            (r, a) => CardManager.applyAction(r, a, false), this.originalCard
        );
        return this.resultCard;
    }

    private clearUnusedProps(data: any): any {
        const result = data;
        const keys = Object.keys(result);
        for (const key of keys) {
            if (result[key] == null) {
                delete result[key];
            }
        }
        return result;
    }
}