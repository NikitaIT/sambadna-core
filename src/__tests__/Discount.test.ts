import { CardManager, CardRecord } from "..";
import { Map as IMap } from 'immutable';

it('Reports Discounts', () => {
    let cards = IMap<string, CardRecord>();
    const invoice1 = new CardRecord({ id: '1' })
        .tag('Name', 'A0001')
        .sub('order1', card =>
            card
                .tag({ id: 't1', name: 'P', value: 'Kola', quantity: 1, amount: 20, source: 'Bar' })
                .tag({ id: 't2', name: '', value: 'HH', amount: 5, source: 'Discount', func: '-(p*a)/100' })
        );
    cards = cards.set(invoice1.id, invoice1);
    expect(invoice1.balance).toEqual(19);
    const tags1 = CardManager.getTagsFrom(['Kola'], cards);
    expect(tags1.reduce((r, c) => r += c.getBalanceFor('Kola'), 0)).toEqual(-19);

    const tags2 = CardManager.getTagsFrom(['Discount'], cards);
    const credit = tags2.reduce((r, c) => r += c.getCreditFor('Discount'), 0);
    expect(credit).toEqual(-1);
});