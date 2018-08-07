import CardOperation from '../CardOperation';
import * as shortid from 'shortid';
import ConfigManager from '../../ConfigManager';
import { ActionRecord, CardRecord } from '../../models';

export default class CreateCard extends CardOperation {
    constructor() {
        super('CREATE_CARD', 'Create Card');
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
        const { id, typeId, type, time } = data;
        let result = new CardRecord({ id, typeId, type, time });
        if (card.id && card.id !== '0') {
            result = card.update('cards', map => map.set(result.id, result));
        }
        return result;
    }

    public fixData(data: any) {
        if (!data.id) {
            data.id = shortid.generate();
        }
        if (!data.typeId) {
            if (data.type) {
                data.typeId = ConfigManager.getCardTypeIdByRef(data.type);
            }
        }
        if (!data.time || data.time === 0) {
            data.time = new Date().getTime();
        }
        return data;
    }

    public processPendingAction(action: ActionRecord): ActionRecord {
        return action;
    }
}