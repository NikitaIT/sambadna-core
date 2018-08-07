import CardOperation from '../CardOperation';
import { CardRecord, ActionRecord } from '../../models';

export default class SelectCard extends CardOperation {
    constructor() {
        super('SELECT_CARD', 'Select Card');
    }
    public canEdit(action: ActionRecord): boolean {
        return true;
    }
    public canApply(card: CardRecord, data: any): boolean {
        return true;
    }
    public readConcurrencyData(card: CardRecord, actionData: any) {
        return undefined;
    }
    public reduce(card: CardRecord, data: any): CardRecord {
        return card;
    }
    public fixData(data: any) {
        return data;
    }
    public processPendingAction(action: ActionRecord): ActionRecord {
        return action;
    }
}