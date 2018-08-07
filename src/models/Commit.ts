import { List, Record } from 'immutable';
import { ActionRecord } from './Action';

export interface ICommit {
    id: string;
    cardId: string;
    time: number;
    terminalId: string;
    user: string;
    actions: List<ActionRecord>;
}

export class CommitRecord extends Record<ICommit>({
    id: '',
    cardId: '',
    time: new Date().getTime(),
    terminalId: '',
    user: '',
    actions: List<ActionRecord>()
}) { }