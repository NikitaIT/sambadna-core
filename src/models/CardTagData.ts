import { CardTagRecord } from './CardTag';
import { CardRecord } from './Card';
import * as moment from 'moment';

export default class {
    public key: string;
    public tag: CardTagRecord;
    public card: CardRecord;

    constructor(key: string, tag: CardTagRecord, card: CardRecord) {
        this.key = key;
        this.tag = tag;
        this.card = card;
    }

    get display(): string {
        // return this.tag.display;
        return this.tag.getFormattedValueDisplay(this.tag.unit, this.tag.quantity, this.tag.value);
    }

    get id(): string {
        return this.tag.id;
    }

    get name(): string {
        return this.card.name;
    }

    get time(): number {
        return this.card.time;
    }

    public get expires(): boolean {
        return this.tag.validUntil > 0;
    }

    public get expirationDate(): string {
        return moment(this.expiration).format();
    }

    public get expiration(): number {
        return this.tag.validUntil;
    }

    public expired(time: number): boolean {
        return this.tag.validUntil < time;
    }

    public get tagValue(): string {
        if (this.tag.unit) {
            return this.tag.value + '.' + this.tag.unit;
        }
        return this.tag.value;
    }

    public getGroupingKeyFor(filter: string): string {
        if (this.isSourceAccount(filter + '.')) {
            return this.tag.source;
        } else if (this.isTargetAccount(filter + '.')) {
            return this.tag.target;
        }
        return this.tagValue;
    }

    public getInDisplayFor(filter: string): string {
        const inValue = this.tag.getInQuantityFor(filter);
        return inValue !== 0 ? String(inValue) : '';
    }

    public getOutDisplayFor(filter: string): string {
        const outValue = this.tag.getOutQuantityFor(filter);
        return outValue !== 0 ? String(outValue) : '';
    }

    public getTotalFor(filter: string): number {
        return this.tag.getInQuantityFor(filter) - this.tag.getOutQuantityFor(filter);
    }

    public getDebitDisplayFor(filter: string): string {
        const debit = this.getDebitFor(filter);
        return debit !== 0 ? debit.toFixed(2) : '';
    }

    public getCreditDisplayFor(filter: string): string {
        const credit = this.getCreditFor(filter);
        return credit !== 0 ? credit.toFixed(2) : '';
    }

    public getBalanceFor(filter: string): number {
        return this.getDebitFor(filter) - this.getCreditFor(filter);
    }

    public isSourceAccount(filter: string): boolean {
        return this.tag.source.toLowerCase().includes(filter.toLowerCase());
    }

    public isTargetAccount(filter: string): boolean {
        return this.tag.target.toLowerCase().includes(filter.toLowerCase());
    }

    public isAccount(filter: string): boolean {
        return this.isSourceAccount(filter) || this.isTargetAccount(filter);
    }

    public getDebitFor(filter: string): number {
        if (this.isAccount(filter)) {
            return this.isTargetAccount(filter) ? this.card.getTagCredit(this.tag) : 0;
            // return this.isTargetAccount(filter) ? this.card.credit : 0;
        }
        if (!this.tag.acceptsFilter(filter)) { return 0; }
        if (!this.tag.source && !this.tag.target) {
            return this.tag.isModifier ? 0 : this.card.debit;
        }
        if (this.tag.target && this.tag.source) {
            return Math.abs(this.card.debit);
        }
        return this.tag.target ? Math.abs(this.card.balance) : 0;
    }

    public getCreditFor(filter: string): number {
        if (this.isAccount(filter)) {
            return this.isSourceAccount(filter) ? this.card.getTagDebit(this.tag) : 0;
            // return this.isSourceAccount(filter) ? this.card.debit : 0;
        }
        if (!this.tag.acceptsFilter(filter)) { return 0; }
        if (!this.tag.source && !this.tag.target) {
            return this.tag.isModifier ? 0 : this.card.credit;
        }
        if (this.tag.target && this.tag.source) {
            return Math.abs(this.card.credit);
        }
        return this.tag.source ? Math.abs(this.card.balance) : 0;
    }
}