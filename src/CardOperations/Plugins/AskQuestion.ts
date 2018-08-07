import CardOperation from '../CardOperation';
import { ActionRecord, CardRecord } from '../../models';

export default class AskQuestion extends CardOperation {
    constructor() {
        super('ASK_QUESTION', 'Ask Question');
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