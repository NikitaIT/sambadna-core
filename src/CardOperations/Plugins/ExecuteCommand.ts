import CardOperation from '../CardOperation';
import { CardRecord, ActionRecord } from '../../models';

export default class ExecuteCommand extends CardOperation {
    constructor() {
        super('EXECUTE_COMMAND', 'Execute Command');
    }
    public canEdit(action: ActionRecord): boolean {
        return !action.data.name;
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