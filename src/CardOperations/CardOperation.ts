import { ActionRecord, CardRecord } from '../models';

export default abstract class CardOperation {
    public type: string;
    public description: string | undefined;
    public canReduce: (card: CardRecord, action: ActionRecord) => boolean;
    constructor(opType: string, description?: string) {
        this.type = opType;
        this.description = description;
    }
    public abstract reduce(card: CardRecord, data: any): CardRecord;
    public abstract canApply(card: CardRecord, data: any): boolean;
    public abstract readConcurrencyData(card: CardRecord, actionData: any): any;
    public abstract fixData(data: any): any;
    public abstract canEdit(action: ActionRecord): boolean;
    public abstract processPendingAction(action: ActionRecord): ActionRecord;
}