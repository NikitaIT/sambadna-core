import { Record } from 'immutable';

export interface IRule {
    id: string;
    name: string;
    content: string;
}

export class RuleRecord extends Record<IRule>({
    id: '',
    name: '',
    content: ''
}) { }