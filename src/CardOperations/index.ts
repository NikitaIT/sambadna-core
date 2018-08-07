import Plugins from './Plugins';
import CardOperation from './CardOperation';
import { ActionRecord, CardRecord } from '../models';

export class CardOperations {
    private operations: Map<string, CardOperation>;

    constructor() {
        this.operations = new Map<string, CardOperation>();
    }
    public register(op: CardOperation) {
        this.operations.set(op.type, op);
    }
    public canHandle(action: ActionRecord) {
        return this.operations.has(action.actionType);
    }
    public get(actionType: string) {
        return this.operations.get(actionType);
    }
    public getConcurrencyData(actionType: string, card: CardRecord, actionData: any) {
        const operation = this.operations.get(actionType);
        return operation && operation.readConcurrencyData(card, actionData);
    }
    public reduce(card: CardRecord, action: ActionRecord): CardRecord {
        const operation = this.operations.get(action.actionType);
        if (operation) {
            return this.reduceAll(card, action, operation);
        }
        return card;
    }
    public reduceAll(card: CardRecord, action: ActionRecord, operation: CardOperation): CardRecord {
        if (!action.cardId || action.cardId === card.id) {
            return operation.reduce(card, action.data);
        } else {
            return card.update('cards', cards => {
                return cards.map(c => {
                    return this.reduceAll(c, action, operation);
                });
            });
        }
    }
    public canReduce(card: CardRecord, action: ActionRecord): boolean {
        const operation = this.operations.get(action.actionType);
        return operation !== undefined && operation.canReduce !== undefined && operation.canReduce(card, action);
    }
    public canApplyAction(card: CardRecord, action: ActionRecord): boolean {
        const operation = this.operations.get(action.actionType);
        if (!operation) { return false; }
        return operation.canApply(card, action.data);
    }
    public getOperations() {
        return Array.from(this.operations.values()).filter(x => x.description);
    }
    public fixData(actionType: string, data: any): any {
        const operation = this.operations.get(actionType);
        if (operation) { return operation.fixData(data); }
        return data;
    }
    public processPendingAction(action: ActionRecord): ActionRecord {
        const operation = this.operations.get(action.actionType);
        if (operation) { return operation.processPendingAction(action); }
        return action;
    }
    public canEdit(action: ActionRecord): boolean {
        const operation = this.operations.get(action.actionType);
        return operation !== undefined && operation.canEdit(action);
    }
}

export const cardOperations: CardOperations = new CardOperations();
Plugins.forEach(x => cardOperations.register(x));