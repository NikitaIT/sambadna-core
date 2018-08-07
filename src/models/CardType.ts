import { Record } from 'immutable';

export interface ICardType {
    id: string;
    name: string;
    reference: string;
    displayFormat: string;
    network: string;
    commands: string[];
    tagTypes: string[];
    subCardTypes: string[];
    color: string;
}

export class CardTypeRecord extends Record<ICardType>({
    id: '',
    name: '',
    reference: '',
    displayFormat: '',
    network: '',
    commands: [],
    tagTypes: [],
    subCardTypes: [],
    color: ''
}) { }