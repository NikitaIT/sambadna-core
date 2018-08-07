import * as shortid from 'shortid';
import { Map as IMap } from 'immutable';
import { cardOperations } from '../CardOperations/index';
import * as Nools from 'nools-ts';
import { CardRecord, RuleRecord, ActionRecord, Widget } from '../models';
import { ActionType } from './ActionType';
import { ResultType } from './ResultType';
import { ActionData } from './ActionData';
import { ContentType } from './ContentType';
import { WidgetType } from './WidgetType';

export class RuleManager {
    private state: Map<string, any>;
    private flows: any[];

    // private rule = `
    // rule test {
    //     when {
    //         a : Action a.type == 'EXECUTE_COMMAND' && a.data.name == 'TEST';
    //     }
    //     then {
    //         r.push(new Action('SET_CARD_TAG',{name:'Test',value:'0000'}))
    //     }
    // }
    // `;

    constructor() {
        this.state = new Map<string, any>();
        this.flows = [];
    }

    public setState(name: string, value: any) {
        console.log('State update', name, value);
        this.state = this.state.set(name, value);
    }

    public getState(name: string) {
        return this.state.get(name);
    }

    public get stateValues() {
        return this.state;
    }

    public setRules(rules: IMap<string, RuleRecord>) {
        const defines = new Map();
        defines.set('State', ActionData);
        defines.set('Action', ActionType);
        defines.set('Result', ResultType);
        defines.set('Content', ContentType);
        defines.set('Card', CardRecord);
        defines.set('Widget', Widget);
        defines.set('Widgets', WidgetType);
        const filteredRules = rules
            .filter(x => !x.name.startsWith('_') && x.content.includes('when'))
            .valueSeq().toArray().filter(rule => this.testRule(rule));
        this.flows = filteredRules.map(rule => {
            const compiled = Nools.compile(rule.content, {
                define: defines
            });
            return compiled;
        });
    }

    public getNewActionsFrom(acts: ActionType[], cardId: string) {
        const actions: ActionRecord[] = [];
        let lastCardId = cardId;
        for (const act of acts) {
            if (act.type === 'RESET_PARENT_CARD') {
                lastCardId = act.data;
                continue;
            }
            const processedData = cardOperations.fixData(act.type, { ...act.data });
            if (!processedData.id) {
                processedData.id = shortid.generate();
            }
            actions.push(new ActionRecord({
                id: shortid.generate(),
                actionType: act.type,
                cardId: lastCardId,
                data: processedData
            }));
            if (act.type === 'CREATE_CARD' && processedData.id) {
                lastCardId = processedData.id;
            }
        }
        return actions;
    }

    public async getNextActions(
        actionType: string, actionData: any,
        actionCardId: string,
        card: CardRecord, root: CardRecord)
        : Promise<ActionRecord[]> {
        return new Promise<ActionRecord[]>(resolve => {
            const promises = this.flows.map(async flow => {
                const result = new ResultType();
                const session = flow.getSession(
                    new ActionData(
                        new ActionType(actionType, actionData),
                        this.state,
                        card, root
                    ),
                    result
                );
                await session.match();
                session.dispose();
                return result;
            });
            Promise.all(promises).then(results => {
                const result = results.reduce((r, a) => a.concatActionsTo(r), [] as ActionType[]);
                resolve(this.getNewActionsFrom(result, actionCardId));
            });
        });
    }

    public async getContent(actionType: string, actionData: any, card: CardRecord, root: CardRecord)
        : Promise<string[]> {
        return new Promise<string[]>(resolve => {
            const promises = this.flows.map(async flow => {
                const result = new ContentType();
                const session = flow.getSession(
                    new ActionData(
                        new ActionType(actionType, actionData),
                        this.state,
                        card, root
                    ),
                    result
                );
                await session.match();
                session.dispose();
                return result;
            });
            Promise.all(promises).then(results => {
                const result = results.reduce((r, a) => r.concat(a.lines), [] as string[]);
                resolve(result);
            });
        });
    }

    public async getWidgets(actionData: any): Promise<Widget[]> {
        return new Promise<Widget[]>(resolve => {
            const promises = this.flows.map(async flow => {
                const result = new WidgetType();
                const session = flow.getSession(
                    new ActionData(new ActionType('GET_WIDGETS', actionData), this.state),
                    result
                );
                await session.match();
                session.dispose();
                return result;
            });
            Promise.all(promises).then(results => {
                const result = results.reduce((r, a) => r.concat(a.widgets), new Array<Widget>());
                resolve(result);
            });
        });
    }

    private testRule(rule: RuleRecord) {
        try {
            const defines = new Map();
            defines.set('State', ActionData);
            defines.set('Action', ActionType);
            defines.set('Result', ResultType);
            defines.set('Content', ContentType);
            defines.set('Card', CardRecord);
            defines.set('Widget', Widget);
            defines.set('Widgets', WidgetType);
            Nools.compile(rule.content, {
                define: defines,
                scope: new Map<string, any>([['r', []]])
            });
            return true;
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.log('error creating rule ' + rule.name, error);
            return false;
        }
    }
}

export default new RuleManager();