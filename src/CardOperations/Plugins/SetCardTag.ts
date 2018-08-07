import * as shortid from 'shortid';
import CardOperation from '../CardOperation';
import CardManager from '../../CardManager';
import { ActionRecord, CardRecord, CardTagRecord, ICardTag } from '../../models';
import ConfigManager from '../../ConfigManager';

export default class SetCardTag extends CardOperation {

    constructor() {
        super('SET_CARD_TAG', 'Set Card Tag');
        this.canReduce = this.canReduceCard;
    }

    public canEdit(action: ActionRecord): boolean {
        return !action.data.name && !action.data.value;
    }

    public readConcurrencyData(card: CardRecord, data: ICardTag) {
        return card.getIn(['tags', data.name]);
    }

    public reduce(card: CardRecord, data: ICardTag): CardRecord {
        const currentTag = card.getIn(['tags', data.name]) as CardTagRecord;
        if (currentTag) {
            const currentData = currentTag.toJS();
            for (const key of Object.keys(currentData)) {
                const currentValue = currentData[key];
                if (currentValue && data[key] == null) {
                    data[key] = currentValue;
                }
            }
        }
        // if (currentData) {
        //     for (const key of Object.keys(data)) {
        //         const value = data[key];
        //         if (value != null && currentData.has(key)) {
        //             currentData = currentData.set(key, value)
        //         }
        //     }
        //     data = currentData.toJS();
        // }
        const fixedData = this.fixData(data);
        // fixedData = this.fixType(card, fixedData);
        const r = new CardTagRecord(fixedData);
        if (this.tagValueRemoved(card, data)) {
            return card.deleteIn(['tags', data.name]);
        }
        if (this.tagAmountRemoved(card, data)) {
            return card.deleteIn(['tags', data.name]);
        }
        return card.setIn(['tags', data.name], r);
    }

    public canReduceCard(card: CardRecord, action: ActionRecord): boolean {
        const current = this.readConcurrencyData(card, action.data) as CardTagRecord;
        return !current || current.value === action.concurrencyData.value;
    }

    public fixData(data: any) {
        if (!Number.isNaN(Number(data.quantity))) { data.quantity = Number(data.quantity); }
        if (!Number.isNaN(Number(data.amount))) { data.amount = Number(data.amount); }
        if (!data.typeId && data.type) {
            const tt = ConfigManager.findTagType(x => x.name === data.type);
            // if (!tt) { data.type = ''; } 
            // Should we clear that? If we have a type that never exists it will continously try to fix that.
            if (tt) {
                data.typeId = tt.id;
                if (!data.name && tt.tagName) {
                    data.name = tt.tagName;
                }
                if (!data.category && tt.defaultCategory) {
                    data.category = tt.defaultCategory;
                }
                if (!data.value && tt.defaultValue) {
                    data.value = tt.defaultValue;
                }
                if ((!data.quantity || data.quantity === 0) && tt.defaultQuantity) {
                    data.quantity = tt.defaultQuantity;
                }
                if (!data.unit && tt.defaultUnit) { data.unit = tt.defaultUnit; }
                if ((!data.amount || data.amount === 0) && tt.defaultAmount) {
                    data.amount = tt.defaultAmount;
                }
                if (!data.func && tt.defaultFunction) {
                    data.func = tt.defaultFunction;
                }
                if (!data.source && tt.defaultSource) {
                    data.source = tt.defaultSource;
                }
                if (!data.target && tt.defaultTarget) {
                    data.target = tt.defaultTarget;
                }
                if (tt.cardTypeReferenceName && data.value) {
                    const card = CardManager.getCardByName(tt.cardTypeReferenceName, data.value);
                    if (card) {
                        if (!data.name) {
                            data.name = tt.cardTypeReferenceName;
                        }
                        if (!data.amount || data.amount === 0) {
                            let amount = card.getTagValue('Amount', '');
                            if (!amount) { amount = card.getTagValue('Price', '') }
                            if (amount) { data.amount = Number(amount); }
                        }
                        if (!data.source) {
                            const source = card.getTagValue('Source', '');
                            if (source) { data.source = source; }
                        }
                        if (!data.target) {
                            const target = card.getTagValue('Target', undefined);
                            if (target) { data.target = target; }
                        }
                    }
                }
            }
        }
        if (!data.name && data.value) {
            data.name = '_' + shortid.generate();
        }
        if (!data.id) {
            data.id = shortid.generate();
        }
        return data;
    }

    public canApply(card: CardRecord, data: ICardTag): boolean {
        const currentValue = card.getIn(['tags', data.name]) as CardTagRecord;
        if (!data.name || (this.valueNeeded(data, currentValue) && !data.value)) {
            return false;
        }
        if (this.amountNeeded(data, currentValue) && data.amount === 0) {
            return false;
        }
        return this.valueChanged(currentValue, data);
    }
    public processPendingAction(action: ActionRecord): ActionRecord {
        const data: ICardTag = action.data;
        data.cardId = '';
        if (!action.data || !action.data.typeId || !action.data.name || !action.data.value) {
            return action.set('data', data);
        }
        const tagType = ConfigManager.getTagTypeById(data.typeId);
        if (tagType) {
            data.formattedValue = tagType.getMaskedDisplayFor(data.value, undefined);
            const cardType = ConfigManager.getCardTypeByRef(tagType.cardTypeReferenceName);
            if (cardType) {
                const card = CardManager.getCardByName(cardType.name, action.data.value);
                data.cardId = card ? card.id : '';
            }

            if (data.source && tagType.sourceCardTypeReferenceName) {
                const sourceCardType = ConfigManager.getCardTypeByRef(tagType.sourceCardTypeReferenceName);
                if (sourceCardType) {
                    const sourceCard = CardManager.getCardByName(sourceCardType.name, data.source);
                    data.sourceCardId = sourceCard ? sourceCard.id : '';
                }
            }

            if (data.target && tagType.targetCardTypeReferenceName) {
                const targetCardType = ConfigManager.getCardTypeByRef(tagType.targetCardTypeReferenceName);
                if (targetCardType) {
                    const targetCard = CardManager.getCardByName(targetCardType.name, data.target);
                    data.targetCardId = targetCard ? targetCard.id : '';
                }
            }
        }
        return action.set('data', data);
    }

    private tagValueRemoved(card: CardRecord, data: ICardTag) {
        return card.tags.has(data.name)
            && card.getTagValue(data.name, undefined)
            && !data.value;
    }

    private tagAmountRemoved(card: CardRecord, data: ICardTag) {
        return card.tags.has(data.name) && data.func && data.amount === 0;
    }

    private valueNeeded(data: any, currentValue: CardTagRecord): boolean {
        return (!currentValue || !currentValue.value) && (data.name.startsWith('_') || data.typeId);
    }

    private amountNeeded(data: any, currentValue: CardTagRecord): boolean {
        return (!currentValue || currentValue.amount === 0) && data.func;
    }

    private valueChanged(currentValue: CardTagRecord, data: any) {
        if (!currentValue) {
            // console.log('has no current value');
            return true;
        }
        if (currentValue.category !== data.category) {
            return true;
        }
        if (currentValue.value !== data.value) {
            // console.log('value changed');
            return true;
        }
        if (currentValue.quantity !== data.quantity) {
            // console.log('quantity changed');
            return true;
        }
        if (currentValue.unit !== data.unit) {
            // console.log('unit changed');
            return true;
        }
        if (currentValue.amount !== data.amount) {
            // console.log('amount changed');
            return true;
        }
        if (currentValue.func !== data.func) {
            // console.log('func changed');
            return true;
        }
        if (currentValue.source !== data.source) {
            // console.log('source changed');
            return true;
        }
        if (currentValue.target !== data.target) {
            // console.log('target changed');
            return true;
        }
        if (currentValue.ref !== data.ref) {
            // console.log('reference changed');
            return true;
        }
        return false;
    }
}