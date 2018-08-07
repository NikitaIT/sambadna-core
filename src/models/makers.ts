import { Map as IMap, List } from 'immutable';
import { ICardData, CardDataRecord } from './CardData';
import { CommitRecord, ICommit } from './Commit';
import { ActionRecord } from './Action';
import { ICard, CardRecord } from './Card';
import { CardTagRecord } from './CardTag';

export const makeDeepCard = (card: ICard): CardRecord => {
    return new CardRecord({
        id: card.id,
        time: card.time,
        typeId: card.typeId,
        type: card.type,
        tags: IMap<string, CardTagRecord>(card.tags),
        cards: IMap<string, CardRecord>(card.cards)
    });
};

export const makeDeepCommit = (commit: ICommit): CommitRecord => {
    return new CommitRecord({
        id: commit.id,
        time: commit.time,
        cardId: commit.cardId,
        terminalId: commit.terminalId,
        user: commit.user,
        actions: List<ActionRecord>(commit.actions.map(action => new ActionRecord(action)))
    });
};

export const makeDeepCardData = (cardData: ICardData): CardDataRecord => {
    return new CardDataRecord({
        card: makeDeepCard(cardData.card),
        commits: List<CommitRecord>(cardData.commits.map(
            commit => makeDeepCommit(commit as ICommit))
        )
    });
};