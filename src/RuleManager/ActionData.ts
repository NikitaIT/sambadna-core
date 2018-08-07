import { ActionType } from "./ActionType";
import { CardRecord } from "../models";
import CardManager from "../CardManager";
import * as _ from 'lodash';

export class ActionData {
    public action: ActionType;
    public card?: CardRecord;
    public root?: CardRecord;
    public state: Map<string, any>;

    constructor(action: ActionType, state: Map<string, any>, card?: CardRecord, root?: CardRecord) {
        this.action = action;
        this.card = card;
        this.root = root;
        this.state = state;
    }
    public load(cardType: string, cardName: string) {
        return CardManager.getCardByName(cardType, cardName);
    }
    public count(cardType: string): number {
        return CardManager.getCount(cardType);
    }
    public padStart(val: string, count: number, ch: string) {
        return _.padStart(val, count, ch);
    }
    public get(key: string) {
        return this.state.get(key);
    }
    public getValue(key) {
        const values = this.getValues(key);
        return Array.isArray(values) ? (values[0] ? values[0].value : undefined) : values;
    }
    public getValues(key) {
        return this.state.has('selectedValues')
            ? this.get('selectedValues')[key]
            : this.get(key);
    }
}