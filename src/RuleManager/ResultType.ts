import { ActionType } from "./ActionType";
import * as shortId from 'shortid';

export class ResultType {
    private actions: ActionType[];

    constructor() {
        this.actions = [];
    }

    public clear() {
        while (this.actions.length > 0) {
            this.actions.pop();
        }
    }

    public add(type: string, data: any) {
        console.log('added', type, data);
        this.actions.push(new ActionType(type, data));
    }

    public generateId() {
        return shortId.generate();
    }

    public resetParent(cardId: number) {
        this.actions.push(new ActionType('RESET_PARENT_CARD', cardId));
    }

    public concatActionsTo(r: ActionType[]) {
        return r.concat(this.actions);
    }
}