import { ActionRecord } from './Action';
import { CardRecord } from './Card';

export interface IActionState {
    action: ActionRecord;
    card: CardRecord;
    root: CardRecord;
}