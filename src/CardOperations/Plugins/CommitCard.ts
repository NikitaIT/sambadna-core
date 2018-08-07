import CardOperation from '../CardOperation';
import { ActionRecord, CardRecord } from '../../models';

export default class CommitCard extends CardOperation {
    constructor() {
        super('COMMIT_CARD', 'Commit Card');
    }
    public canEdit(action: ActionRecord): boolean {
        return false;
    }
    public canApply(card: CardRecord, data: any): boolean {
        return data.id;
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