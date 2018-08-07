import CardOperation from '../CardOperation';
import { CardRecord, ActionRecord } from '../../models';

export default class SetCardTag extends CardOperation {
    constructor() {
        super('SET_CARD_INDEX', 'Set Card Index');
    }
    public canEdit(action: ActionRecord): boolean {
        return true;
    }
    public readConcurrencyData(card: CardRecord, data: any) {
        return undefined;
    }
    public reduce(card: CardRecord, data: any): CardRecord {
        return card.set('index', data.index);
    }
    public fixData(data: any) {
        return data;
    }
    public canApply(card: CardRecord, data: any): boolean {
        return card.index !== data.index;
    }
    public processPendingAction(action: ActionRecord): ActionRecord {
        return action;
    }
}