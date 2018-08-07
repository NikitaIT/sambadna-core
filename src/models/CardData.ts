import { CardRecord } from './Card';
import { CommitRecord } from './Commit';
import { List, Record } from 'immutable';

export interface ICardData {
    card: CardRecord;
    commits: List<CommitRecord>;
}

export class CardDataRecord extends Record<ICardData>({
    card: new CardRecord(),
    commits: List<CommitRecord>()
}) { }