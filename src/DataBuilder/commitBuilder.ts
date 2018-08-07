import { CardTypeRecord, ActionRecord } from '../models';
import * as shortid from 'shortid';
import { List } from 'immutable';

export class CommitBuilder {
    public buildCommit(cardType: CardTypeRecord, tags: Array<{ name: string, value: string, type?: string }>) {
        const cardId = shortid.generate();
        let actions = List<ActionRecord>();
        actions = actions.push(this.getCardCreateAction(cardId, cardType));
        for (const tag of tags) {
            actions = actions.push(this.getTagCardAction(cardId, {
                name: tag.name, value: tag.value, type: tag.type
            }));
        }
        const commit = {
            id: shortid.generate(),
            time: new Date().getTime(),
            cardId,
            actions: actions.toJS(),
        };
        return commit;
    }

    public addSubCardToCommit(commit: { actions: any[], cardId: string }, cardType: CardTypeRecord, name: string) {
        const cardId = shortid.generate();
        let action = this.getCardCreateAction(cardId, cardType);
        action = action.set('cardId', commit.cardId);
        commit.actions.push(action);
        const nameAction = this.getTagCardAction(cardId, { name: 'Name', value: name });
        commit.actions.push(nameAction);
        return commit;
    }

    private getCardCreateAction(cardId: string, cardType: CardTypeRecord) {
        return new ActionRecord({
            actionType: 'CREATE_CARD',
            id: shortid.generate(),
            data: {
                id: cardId,
                typeId: cardType.id,
                type: cardType.name,
                time: new Date().getTime()
            }
        });
    }

    private getTagCardAction(cardId: string, data: any) {
        return new ActionRecord({
            actionType: 'SET_CARD_TAG',
            id: shortid.generate(),
            cardId,
            data
        });
    }
}