import { List, Map as IMap, Set as ISet } from 'immutable';
import {
    CommitRecord, ICommit, CardRecord, CardTypeRecord, ActionRecord,
    CardTagData, CardTagRecord, makeDeepCommit
} from './models';
import { cardOperations } from './CardOperations/index';
import ConfigManager from './ConfigManager';

export class CardManager {
    private postCommit: (commits: any[]) => void;
    private removeCommits: (cardIds: string[]) => void;

    private commits: IMap<string, List<CommitRecord>>;
    private cards: IMap<string, CardRecord>;
    private otherIndex: IMap<string, ISet<string>>;

    constructor() {
        this.commits = IMap<string, List<CommitRecord>>();
        this.cards = IMap<string, CardRecord>();
        this.otherIndex = IMap<string, ISet<string>>();
    }

    public integrateProtocol(postCommit: (commits: any[]) => void, removeCommits: (cardIds: string[]) => void) {
        this.postCommit = postCommit;
        this.removeCommits = removeCommits;
    }

    public readConcurrencyData(actionType: string, card: CardRecord, actionData: any): any {
        return cardOperations.getConcurrencyData(actionType, card, actionData);
    }

    public applyAction(card: CardRecord = new CardRecord(), action: ActionRecord, executeRules: boolean = false): CardRecord {
        if (cardOperations.canHandle(action)) {
            return cardOperations.reduce(card, action);
        }
        return card;
    }

    public canApplyAction(card: CardRecord, action: ActionRecord): boolean {
        return cardOperations.canApplyAction(card, action);
    }

    public actionReduce = (card: CardRecord, action: ActionRecord) => {
        return this.applyAction(card, action);
    }

    public commitReduce = (card: CardRecord, commit: CommitRecord) => {
        const result = commit.actions.reduce(this.actionReduce, card);
        this.otherIndex = this.otherIndex.update(result.typeId, set => {
            if (!set) { set = ISet<string>(); }
            return set.add(result.id);
        });
        return result;
    }

    public addCommits(commits: ICommit[]) {
        for (const commit of commits) {
            this.addCommit(commit);
        }
    }

    public getCards(): IMap<string, CardRecord> {
        return this.cards;
    }

    public reduceTags(card: CardRecord, list: List<CardTagData>, lowcaseFilters: string[]) {
        const foundTags = card.getTags(lowcaseFilters);
        list = list.merge(foundTags.result
            .map(ft => new CardTagData(foundTags.filter, ft, card)));
        return card.cards.reduce((r, c) => this.reduceTags(c, r, lowcaseFilters), list);
    }

    public getTags(lowcaseFilters: string[]): List<CardTagData> {
        return this.getTagsFrom(lowcaseFilters, this.cards);
    }

    public getTagsFrom(lowcaseFilters: string[], cards: IMap<string, CardRecord>): List<CardTagData> {
        return cards.reduce((r, card) => this.reduceTags(card, r, lowcaseFilters), List<CardTagData>());
    }

    public getCardsByType(typeId: string): List<CardRecord> {
        if (typeId && this.otherIndex) {
            const index = this.otherIndex.get(typeId);
            if (index) {
                return index.toList()
                    .map(id => this.cards.get(id) as CardRecord)
                    .filter(x => x)
                    .sortBy(x => -x.time)
                    || List<CardRecord>();
            }
        }
        return List<CardRecord>();
    }

    public getCardsByTypeName(name: string): List<CardRecord> {
        const ct = ConfigManager.getCardTypeIdByRef(name);
        return this.getCardsByType(ct);
    }

    public queryCards(
        typeName: string,
        filter: (c: CardRecord) => boolean,
        grouper: (c: CardRecord) => string
    ): object {
        const typeId = ConfigManager.getCardTypeIdByRef(typeName);
        if (typeId && this.otherIndex) {
            const index = this.otherIndex.get(typeId);
            if (index) {
                const cards = index.toList()
                    .map(id => this.cards.get(id) as CardRecord)
                    .filter(x => filter(x))
                    .sortBy(x => -x.time);
                return cards.groupBy(c => grouper(c))
                    .toOrderedMap()
                    .reduce((r, m, k) => {
                        r[k] = m.valueSeq().toArray();
                        return r;
                    }, {});
            }
        }
        return {};
    }

    public getCardById(id: string): CardRecord | undefined {
        return this.cards.get(id);
    }

    public hasCard(cardId: string): boolean {
        return this.cards.has(cardId);
    }

    public getCardByName(type: string, name: string): CardRecord | undefined {
        const ctId = ConfigManager.getCardTypeIdByRef(type);
        return this.getCardsByType(ctId).find(c => c.hasTag('Name', name)) as CardRecord;
    }

    public getCommits(id: string): List<CommitRecord> | undefined {
        return this.commits.get(id);
    }

    public findCards(cardType: CardTypeRecord, value: string, showAllCards: boolean = false): CardRecord[] {
        const inputValue = value.toLowerCase();
        const index = this.otherIndex.get(cardType.id) || ISet<string>();
        const resultItems: CardRecord[] = [];
        index.toArray().every(i => {
            const card = this.cards.get(i) as CardRecord;
            if ((showAllCards || !card.isClosed) && card.includes(inputValue)) {
                resultItems.push(card);
            }
            return resultItems.length < 50 || inputValue.length > 3;
        });
        return resultItems.sort((a, b) => this.sort(a, b, inputValue));
    }

    public sort(a: CardRecord, b: CardRecord, compare: string): number {
        const first = a.name.toLowerCase();
        const second = b.name.toLowerCase();
        if (first.startsWith(compare) && !second.startsWith(compare)) { return -1; }
        if (!first.startsWith(compare) && second.startsWith(compare)) { return 1; }
        if (first > second) { return 1; }
        if (first < second) { return -1; }
        return 0;
    }

    public getCardSuggestions(ref: string, value: string): Array<{ label: string }> {
        const inputLength = value.length;
        if (inputLength === 0 || !ref) { return []; }
        const cardType = ConfigManager.getCardTypeByRef(ref) || new CardTypeRecord();
        let result = [] as Array<{ label: string }>;
        if (cardType.name) {
            result = this.findCards(cardType, value)
                .map(r => ({ label: r.name }));
        }
        return result;
    }

    public getTagSortIndexByCard(card: CardRecord, tag: CardTagRecord): number {
        const ct = ConfigManager.getCardTypeById(card.typeId);
        let result = ct ? ct.tagTypes.indexOf(tag.typeId) : -1;
        if (result === -1) { result = 99999; }
        return result;
    }

    public getCount(cardType: string) {
        const cti = ConfigManager.getCardTypeIdByRef(cardType);
        const index = this.otherIndex.get(cti);
        return index ? index.count() : 0;
    }

    public deleteCards(cardTypeId: string) {
        const typeIndex = this.otherIndex.get(cardTypeId);
        if (typeIndex) {
            this.removeCommits(typeIndex.toArray());
        }
    }

    public postCommits(commits: any[]) {
        this.postCommit(commits);
    }

    private addCommit(commit: ICommit) {
        this.commits = this.commits.update(commit.cardId, list => {
            if (!list) { list = List<CommitRecord>(); }
            // not really needed but prevents duplicate commits on hot update
            if (!list.find(c => c.id === commit.id)) {
                return list.push(makeDeepCommit(commit));
            }
            return list;
        });
        this.cards = this.cards.update(commit.cardId, cardRecord => {
            const commits = this.commits.get(commit.cardId) as List<CommitRecord>;
            const result = commits
                .sortBy(x => x.time)
                .reduce(this.commitReduce, new CardRecord());
            return result;
        });
    }
}

export default new CardManager();