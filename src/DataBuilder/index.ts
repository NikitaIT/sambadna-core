import rules from './Rules';
import cardTypes from './CardTypes';
import tagTypes from './TagTypes';
import { CardBuilder } from './cardBuilder';
import { Map as IMap } from 'immutable';

export class DataBuilder {
    public createConfig(): IMap<string, IMap<string, any>> {
        let result = IMap<string, IMap<string, any>>();
        result = result.set('rules', rules());
        result = result.set('cardTypes', cardTypes());
        result = result.set('tagTypes', tagTypes());
        return result;
    }

    public getDefaultCardCommits() {
        const cb = require('./cardBuilder').default as CardBuilder;
        return cb.getDefaultCardCommits();
    }

    public getFakeCustomerCommits(count: number = 500): any[] {
        const cb = require('./cardBuilder').default as CardBuilder;
        return cb.getFakeCustomers(count);
    }

    public getFakeProductCommits(count: number = 50): any[] {
        const cb = require('./cardBuilder').default as CardBuilder;
        return cb.getFakeProducts(count);
    }
}