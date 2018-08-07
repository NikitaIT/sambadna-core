import { Record } from 'immutable';

export interface IAction {
    id: string;
    cardId: string;
    actionType: string;
    data: any;
    concurrencyData: any;
}

export class ActionRecord extends Record<IAction>({
    id: '',
    cardId: '',
    actionType: '',
    data: {},
    concurrencyData: undefined
}) {
    public relatesToCard(cardId: string): boolean {
        if (this.actionType === 'CREATE_CARD') {
            return this.data.id === cardId;
        }
        return this.cardId === cardId;
    }
}
