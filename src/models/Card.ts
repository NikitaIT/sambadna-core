import { Record, Map as IMap, List } from 'immutable';
import { CardTagRecord, ICardTag } from './CardTag';

export interface ICard {
    id: string;
    time: number;
    typeId: string;
    type: string;
    isClosed: boolean;
    validationIssues: List<string>;
    index: number;
    tags: IMap<string, CardTagRecord>;
    cards: IMap<string, CardRecord>;
}

export class CardRecord extends Record<ICard>({
    id: '',
    time: 0,
    typeId: '',
    type: '',
    index: 0,
    validationIssues: List<string>(),
    isClosed: false,
    tags: IMap<string, CardTagRecord>(),
    cards: IMap<string, CardRecord>()
}) {
    public getTagTotal(tag: CardTagRecord): number {
        let debit = 0;
        let credit = 0;
        const masterTag = this.masterTag;
        for (const key of this.tagsSorted.keySeq().toArray()) {
            const t = this.tags.get(key) as CardTagRecord;
            const d = t.getDebit(masterTag, this.subCardDebit + debit, this.subCardCredit + credit);
            const c = t.getCredit(masterTag, this.subCardDebit + debit, this.subCardCredit + credit);
            if (t.id === tag.id) {
                return d - c;
            }
            debit = debit + d;
            credit = credit + c;
        }
        return debit - credit;
    }

    public getTagDebit(tag: CardTagRecord): number {
        let debit = 0;
        let credit = 0;
        const masterTag = this.masterTag;
        for (const key of this.tagsSorted.keySeq().toArray()) {
            const t = this.tags.get(key) as CardTagRecord;
            const d = t.getDebit(masterTag, this.subCardDebit + debit, this.subCardCredit + credit);
            const c = t.getCredit(masterTag, this.subCardDebit + debit, this.subCardCredit + credit);
            if (t.id === tag.id) {
                return d;
            }
            debit = debit + d;
            credit = credit + c;
        }
        return debit;
    }

    public getTagCredit(tag: CardTagRecord): number {
        let debit = 0;
        let credit = 0;
        const masterTag = this.masterTag;
        for (const key of this.tagsSorted.keySeq().toArray()) {
            const t = this.tags.get(key) as CardTagRecord;
            const d = t.getDebit(masterTag, this.subCardDebit + debit, this.subCardCredit + credit);
            const c = t.getCredit(masterTag, this.subCardDebit + debit, this.subCardCredit + credit);
            if (t.id === tag.id) {
                return c;
            }
            debit = debit + d;
            credit = credit + c;
        }
        return credit;
    }

    get debit(): number {
        let preDebit = 0;
        let preCredit = 0;
        const masterTag = this.masterTag;
        const tagDebit = this.tagsSorted.reduce(
            (r, t) => {
                const result = r + t.getDebit(masterTag, this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preDebit = preDebit + t.getDebit(masterTag, this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preCredit = preCredit + t.getCredit(masterTag, this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                return result;
            },
            0);
        return tagDebit + this.subCardDebit;
    }

    get credit(): number {
        let preDebit = 0;
        let preCredit = 0;
        const masterTag = this.masterTag;
        const tagCredit = this.tagsSorted.reduce(
            (r, t) => {
                const result = r + t.getCredit(masterTag, this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preDebit = preDebit + t.getDebit(masterTag, this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                preCredit = preCredit + t.getCredit(masterTag, this.subCardDebit + preDebit, this.subCardCredit + preCredit);
                return result;
            },
            0);
        return tagCredit + this.subCardCredit;
    }

    get balance(): number {
        return Math.round((this.debit - this.credit) * 100) / 100;
    }

    get masterTag(): CardTagRecord | undefined {
        return this.tags.find(x => x.hasSource || x.hasTarget);
    }

    get debitDisplay(): string {
        const debit = this.debit;
        if (debit !== 0) { return debit.toFixed(2); }
        return '';
    }

    get creditDisplay(): string {
        const credit = this.credit;
        if (credit !== 0) { return credit.toFixed(2); }
        return '';
    }

    get balanceDisplay(): string {
        const balance = this.balance;
        if (balance !== 0) { return balance.toFixed(2); }
        return '';
    }

    get subCardDebit(): number {
        return this.cards.reduce((x, y) => x + y.debit, 0);
    }

    get subCardCredit(): number {
        return this.cards.reduce((x, y) => x + y.credit, 0);
    }

    get subCardBalance(): number {
        return this.subCardDebit - this.subCardCredit;
    }

    get display(): string {
        return this.name || this.id;
    }

    get name(): string {
        return this.tags.getIn(['Name', 'value']) || '';
    }

    get category(): string {
        return this.tags.getIn(['Category', 'value']) || '';
    }

    get allTags(): CardTagRecord[] {
        return this.tagsSorted.valueSeq().toArray();
    }

    get tagsSorted(): IMap<string, CardTagRecord> {
        return this.tags.sortBy(x => x.index);
    }

    get allCards(): CardRecord[] {
        return this.cards.filter(x => !x.isClosed).valueSeq().toArray();
    }

    get allCardsSorted(): CardRecord[] {
        return this.allCards.sort((a, b) => {
            if (a.index < b.index) { return -1 };
            if (a.index > b.index) { return 1 };
            if (a.index === b.index) { return a.time - b.time };
            return 0;
        });
    }

    get isValid(): boolean {
        return this.validationIssues.count() === 0;
    }

    public getSubCard(name: string): CardRecord | undefined {
        if (!name) { return undefined; }
        if (this.name === name) { return this; }
        return this.cards.find(card => card.getSubCard(name) !== undefined);
    }

    public findSubTag(subCardName: string, tagValue: string): CardTagRecord | undefined {
        const subCard = this.getSubCard(subCardName);
        return subCard && subCard.tags.find(t => t.value === tagValue);
    }

    public getCard(id: string): CardRecord | undefined {
        if (!id) { return undefined; }
        if (this.id === id) { return this; }
        return this.cards.find(card => card.getCard(id) !== undefined);
    }

    public getTags(lowcaseFilters: string[]): { filter: string, result: List<CardTagRecord> } {
        for (const filter of lowcaseFilters) {
            const filteredTags = this.tagsSorted.filter(t => t.acceptsFilter(filter));
            if (filteredTags.count() > 0) {
                return { filter, result: List<CardTagRecord>(filteredTags.valueSeq()) };
            }
        }
        return { filter: '', result: List<CardTagRecord>() };
    }

    public hasTag(name: string, value: string): boolean {
        return this.tags.find(v => v.name === name && v.value === value) !== undefined;
    }

    public getTagValue(name: string, defaultValue: any): {} {
        const tag = this.tags.find(v => v.name === name);
        return tag ? tag.value : defaultValue;
    }

    public getTagAmount(name: string): number | undefined {
        const tag = this.tags.find(v => v.name === name);
        return tag ? tag.amount : undefined;
    }

    public getTagSource(name: string): string | undefined {
        const tag = this.tags.find(v => v.name === name);
        return tag ? tag.source : undefined;
    }

    public getTagTarget(name: string): string | undefined {
        const tag = this.tags.find(v => v.name === name);
        return tag ? tag.target : undefined;
    }

    public sub(id: string, f?: (c: CardRecord) => CardRecord): CardRecord {
        let card = new CardRecord({ id });
        if (f) {
            card = f(card);
        }
        return this.setIn(['cards', id], card);
    }

    public tag(tag: string | Partial<ICardTag>, value?: string): CardRecord {
        if (typeof tag === 'string') {
            return this.setIn(['tags', tag], new CardTagRecord({ name: tag, value }));
        }
        return this.setIn(['tags', tag.name], new CardTagRecord(tag));
    }

    public includes(lowCaseSearchValue: string): boolean {
        return this.tags.some(tag => tag.value.toLowerCase().includes(lowCaseSearchValue))
    }

    public addValidationIssue(issue: string): CardRecord {
        return this.update('validationIssues', items => items.push(issue));
    }
}