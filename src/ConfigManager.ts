import { Map as IMap, Set as ISet } from 'immutable';
import { CardTypeRecord, TagTypeRecord, RuleRecord } from './models';
import { RuleManager } from '.';

export class ConfigManager {
    private setConfig: (name: string, data: IMap<string, any>) => void;

    private cardTypes: IMap<string, CardTypeRecord>;
    private tagTypes: IMap<string, TagTypeRecord>;
    private rules: IMap<string, RuleRecord>;

    constructor() {
        this.cardTypes = IMap<string, CardTypeRecord>();
        this.tagTypes = IMap<string, TagTypeRecord>();
    }

    get protocolIntegrated(): boolean { return Boolean(this.setConfig); }
    get tagTypeValues(): TagTypeRecord[] { return this.tagTypes.valueSeq().toArray() }
    get cardTypeValues(): CardTypeRecord[] { return this.cardTypes.valueSeq().toArray() }

    public integrateProtocol(setConfig: (name: string, data: IMap<string, any>) => void): any {
        this.setConfig = setConfig;
    }

    public saveCardTypes(cardTypes: IMap<string, CardTypeRecord>) {
        this.setConfig('cardTypes', cardTypes);
    }

    public saveTagTypes(tagTypes: IMap<string, TagTypeRecord>) {
        this.setConfig('tagTypes', tagTypes);
    }

    public saveRules(rules: IMap<string, RuleRecord>) {
        this.setConfig('rules', rules);
    }

    public setCardTypes(cardTypes: IMap<string, CardTypeRecord>) {
        this.cardTypes = cardTypes;
    }

    public setTagTypes(tagTypes: IMap<string, TagTypeRecord>) {
        this.tagTypes = tagTypes;
    }

    public setRules(rules: IMap<string, RuleRecord>) {
        this.rules = rules;
    }

    public setApplicationParameter(name: string, value: string) {
        RuleManager.setState(name, value);
    }

    public updateConfig(config: Map<string, any>) {
        if (config.has('cardTypes')) {
            const cardTypes = config.get('cardTypes');
            const cardTypeMap = Object.keys(cardTypes)
                .reduce((x, y) => x.set(y, new CardTypeRecord(cardTypes[y])), IMap<string, CardTypeRecord>());
            this.setCardTypes(cardTypeMap);
        }
        if (config.has('tagTypes')) {
            const tagTypes = config.get('tagTypes');
            const tagTypeMap = Object.keys(tagTypes).
                reduce((x, y) => x.set(y, new TagTypeRecord(tagTypes[y])), IMap<string, TagTypeRecord>());
            this.setTagTypes(tagTypeMap);
        }
        if (config.has('rules')) {
            const rules = config.get('rules');
            const ruleMap = Object.keys(rules)
                .reduce((x, y) => x.set(y, new RuleRecord(rules[y])), IMap<string, RuleRecord>());
            this.setRules(ruleMap);
            RuleManager.setRules(ruleMap);
        }
    }

    public hasCardType(id: string): boolean {
        return this.cardTypes.has(id);
    }

    public getCardTypes() {
        return this.cardTypes;
    }

    public getTagTypes() {
        return this.tagTypes;
    }

    public getRules() {
        return this.rules;
    }

    public getCardTypeIdByRef(ref: string): string {
        const ct = this.getCardTypeByRef(ref);
        if (ct) { return ct.id; }
        return '';
    }

    public getCardTypeByRef(ref: string): CardTypeRecord | undefined {
        const ct = this.cardTypes.find(x => x.reference === ref || x.name === ref);
        return ct;
    }

    public getCardTypeById(id: string): CardTypeRecord | undefined {
        return this.cardTypes.get(id);
    }

    public hasTagType(id: string): boolean {
        return this.tagTypes.has(id);
    }

    public getTagTypeById(id: string): TagTypeRecord | undefined {
        return this.tagTypes.get(id);
    }

    public findTagType(predictor: (tagType: TagTypeRecord) => boolean) {
        return this.tagTypes.find(predictor);
    }

    public getRootCardTypes(): string[] {
        const sc = this.getSubCardTypes();
        return this.cardTypes
            .valueSeq()
            .filter(x => sc.indexOf(x.id) === -1)
            .map(x => x.name)
            .sortBy(x => x)
            .toArray();
    }

    public replaceParameters(sourceValue: string): string {
        let result = sourceValue;
        for (const parameter of RuleManager.stateValues) {
            result = result.replace(`{${parameter[0]}}`, parameter[1])
        }
        return result;
    }

    public getSubNetworksFromCardTypes(mainNetwork: string): string[] {
        const result: string[] = [];
        for (const ct of this.cardTypes.valueSeq()) {
            if (ct.network) {
                let nn = mainNetwork + ct.network;
                nn = this.replaceParameters(nn);
                if (result.indexOf(nn) === -1) {
                    result.push(nn);
                }
            }
        }
        return result;
    }

    private getSubCardTypes(): string[] {
        let result: ISet<string> = ISet<string>();
        result = this.cardTypes.reduce((r, ct) => this.pushSubCardTypes(ct, r), result);
        return result.toArray();
    }

    private pushSubCardTypes(cardType: CardTypeRecord, result: ISet<string>): ISet<string> {
        const subCards = cardType.subCardTypes
            .filter(x => this.cardTypes.has(x) && !result.has(x))
            .map(x => this.getCardTypeById(x) as CardTypeRecord);
        result = result.concat(subCards.map(x => x.id));
        result = subCards.reduce((r, ct) => this.pushSubCardTypes(ct, r), result);
        return result;
    }
}

export default new ConfigManager();