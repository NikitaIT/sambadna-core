import CardOperation from '../CardOperation';
import { ActionRecord, CardRecord } from '../../models';
import CardValidator from '../../CardValidator';

export default class CloseCard extends CardOperation {
    constructor() {
        super('CLOSE_CARD', 'Close Card');
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
        let result = card.set('isClosed', true).update('validationIssues', l => l.clear());
        result = CardValidator.validate(result);
        if (!result.isValid) {
            result = result.set('isClosed', false);
        }
        return result;
    }
    public fixData(data: any) {
        return data;
    }
    public processPendingAction(action: ActionRecord): ActionRecord {
        return action;
    }
}