import { Record } from 'immutable';
import { CardTagRecord } from './CardTag';
import { conformToMask } from 'vanilla-text-mask';
import { ICardTag } from '.';
import * as moment from 'moment';

type dateUnits = "year" | "years" | "y" | "month" | "months" | "M" | "week" | "weeks" | "w" | "day" | "days" | "d" | "hour" | "hours" | "h" | "minute" | "minutes" | "m" | "second" | "seconds" | "s" | "millisecond" | "milliseconds" | "ms" | "quarter" | "quarters" | "Q" | undefined;

export interface ITagType {
    id: string;
    name: string;
    tagName: string;
    cardTypeReferenceName: string;
    showCategory: boolean;
    showValue: boolean;
    showQuantity: boolean;
    showUnit: boolean;
    showAmount: boolean;
    showSource: boolean;
    showTarget: boolean;
    showFunction: boolean;
    showValidUntil: boolean;
    sourceCardTypeReferenceName: string;
    targetCardTypeReferenceName: string;
    displayFormat: string;
    icon: string;
    mask: string;
    defaultFunction: string;
    defaultCategory: string;
    defaultValue: string;
    defaultSource: string;
    defaultTarget: string;
    defaultQuantity: number;
    defaultUnit: string;
    defaultAmount: number;
    defaultValidUntil: string;
}

export class TagTypeRecord extends Record<ITagType>({
    id: '',
    name: '',
    tagName: '',
    cardTypeReferenceName: '',
    showCategory: true,
    showValue: true,
    showQuantity: true,
    showUnit: true,
    showAmount: true,
    showSource: true,
    showTarget: true,
    showFunction: false,
    showValidUntil: false,
    sourceCardTypeReferenceName: '',
    targetCardTypeReferenceName: '',
    displayFormat: '',
    icon: '',
    mask: '',
    defaultFunction: '',
    defaultCategory: '',
    defaultValue: '',
    defaultSource: '',
    defaultTarget: '',
    defaultQuantity: 0,
    defaultUnit: '',
    defaultAmount: 0,
    defaultValidUntil: ''
}) {
    private internalRealMask;

    public get realMask() {
        if (this.internalRealMask === undefined) {
            this.internalRealMask = this.createMaskFrom(this.mask);
        }
        return this.internalRealMask;
    }

    public isTagSelection(): boolean {
        if (!this.id || !this.cardTypeReferenceName || !this.showValue || this.showCategory
            || this.showQuantity || this.showUnit || this.showAmount || this.showValidUntil
            || this.showSource || this.showTarget || this.showFunction) {
            return false;
        }
        return true;
    }

    public getValueDisplay(tag: CardTagRecord) {
        const formattedValue = tag.formattedValue || this.getMaskedDisplayFor(tag.value);
        return tag.getFormattedValueDisplay(tag.unit, tag.quantity, formattedValue);
    }

    public getMaskedDisplayFor(value: string, defaultResult: string = value) {
        if (this.realMask) {
            const conformedResult = conformToMask(value, this.realMask, { guide: false });
            return conformedResult.conformedValue;
        }
        return defaultResult;
    }

    public createMaskFrom(mask: string) {
        if (!mask) { return null; }
        const parts = mask.split(' ');
        const result = parts.map(x => {
            if (x.length > 1) {
                return new RegExp(x);
            }
            if (x === '_') { return ' '; }
            return x;
        });
        return result;
    }

    public createDefaultTag(): Partial<ICardTag> {
        return {
            typeId: this.id,
            name: this.tagName || this.cardTypeReferenceName,
            category: this.defaultCategory,
            value: this.defaultValue,
            quantity: this.defaultQuantity,
            unit: this.defaultUnit,
            amount: this.defaultAmount,
            func: this.defaultFunction,
            source: this.defaultSource,
            target: this.defaultTarget,
            validUntil: this.generateValidUntil()
        }
    }

    public generateValidUntil(): number | undefined {
        if (!this.defaultValidUntil) { return undefined };
        const parts = this.defaultValidUntil.split(' ');
        if (parts.length === 1) {
            return moment().add(parts[0], 'd').toDate().getTime();
        }
        if (parts.length === 2) {
            return moment().add(parts[0], this.getDatePart(parts[1])).toDate().getTime();
        }
        return undefined;
    }

    private getDatePart(template: string): dateUnits {
        return template as dateUnits;
    }
}