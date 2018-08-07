import { CommitBuilder } from './commitBuilder';
import tables from './CardTypes/tables';
import locations from './CardTypes/locations';
import products from './CardTypes/products';
import customers from './CardTypes/customers';
import modifierGroups from './CardTypes/modifierGroups';
import modifier from './CardTypes/modifiers';
import * as faker from 'faker';
import * as _ from 'lodash';

export class CardBuilder {
    private commitBuilder = new CommitBuilder();

    public getDefaultCardCommits() {
        const result: any[] = [];
        result.push(...this.getTableCommits());
        result.push(...this.getLocationCommits());
        result.push(...this.getProductCommits());
        result.push(this.getModifierGroupCommit('Vegetables', ['Onions', 'Lettuces', 'Tomatoes', 'Mushrooms']))
        return result;
    }

    public getTableCommits() {
        return _.range(11, 29).map(x => 'B' + x).map(x => this.getTableCommit(x));
    }

    public getLocationCommits() {
        return ['Bar', 'Kitchen']
            .map(x => this.getLocationCommit(x));
    }

    public getProductCommits() {
        const result: any[] = [];
        result.push(this.getProductCommit('Pizza', 'Kitchen', '12.5'));
        result.push(this.getProductCommit('Hamburger', 'Kitchen', '11'));
        result.push(this.getProductCommit('Water', 'Bar', '1'));
        result.push(this.getProductCommit('Coke', 'Bar', '3'));
        return result;
    }

    public getModifierGroupCommit(name: string, modifiers: string[]) {
        const commit = this.commitBuilder.buildCommit(modifierGroups, [{ name: 'Name', value: name }]);
        for (const modifierName of modifiers) {
            this.commitBuilder.addSubCardToCommit(commit, modifier, modifierName);
        }
        return commit;
    }

    public getTableCommit(name: string) {
        return this.commitBuilder.buildCommit(tables, [{ name: 'Name', value: name }]);
    }

    public getLocationCommit(name: string) {
        return this.commitBuilder.buildCommit(locations, [{ name: 'Name', value: name }]);
    }

    public getProductCommit(name: string, location: string, amount: string) {
        return this.commitBuilder.buildCommit(
            products,
            [
                { name: 'Name', value: name },
                { name: 'Source', value: location },
                { name: 'Price', value: amount }
            ]);
    }

    public getFakeCustomer() {
        return this.commitBuilder.buildCommit(
            customers,
            [
                { name: 'Name', value: faker.name.findName() },
                { name: 'Address', value: faker.address.streetAddress(), type: 'Customer Address' },
                { name: 'Phone', value: faker.phone.phoneNumber(), type: 'Customer Phone' },
            ]
        );
    }

    public getFakeCustomers(count: number) {
        const result: any[] = [];
        for (let index = 0; index < count; index++) {
            result.push(this.getFakeCustomer());
        }
        return result;
    }

    public getFakeProduct() {
        return this.commitBuilder.buildCommit(
            products,
            [
                { name: 'Name', value: faker.commerce.productName() },
                { name: 'Category', value: faker.commerce.department() },
                { name: 'Price', value: faker.commerce.price(5, 60) },
                { name: 'Source', value: 'Kitchen' },
            ]
        );
    }

    public getFakeProducts(count: number) {
        const result: any[] = [];
        for (let index = 0; index < count; index++) {
            result.push(this.getFakeProduct());
        }
        return result;
    }

}

export default new CardBuilder();