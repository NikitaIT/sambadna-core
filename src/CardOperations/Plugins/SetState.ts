import CardOperation from '../CardOperation';
import RuleManager from '../../RuleManager';
import { ActionRecord, CardRecord } from '../../models';

export default class SetState extends CardOperation {
    constructor() {
        super('SET_STATE', 'Set State');
    }
    public canEdit(action: ActionRecord): boolean {
        return false;
    }
    public canApply(card: CardRecord, data: any): boolean {
        return true;
    }
    public readConcurrencyData(card: CardRecord, actionData: any) {
        return undefined;
    }
    public reduce(card: CardRecord, data: any): CardRecord {
        if (data.name) { RuleManager.setState(data.name, data.value); }
        return card;
    }
    public fixData(data: any) {
        return data;
    }
    public processPendingAction(action: ActionRecord): ActionRecord {
        return action;
    }
}