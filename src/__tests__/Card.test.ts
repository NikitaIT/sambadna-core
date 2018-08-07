import { CardRecord, CardTagRecord } from '../models';

it('creates card', () => {
    const c = new CardRecord({ id: '0' });
    expect(c.id).toEqual('0');
});

it('tags card name', () => {
    let c = new CardRecord();
    c = c.tag('Name', 'Test');
    expect(c.name).toEqual('Test');
});

it('creates sub card', () => {
    let c = new CardRecord();
    c = c.sub('xyz');
    expect(c.cards.count()).toEqual(1);
    const subCard = c.cards.get('xyz') as CardRecord;
    expect(subCard.id).toEqual('xyz');
});

it('tags sub card', () => {
    let c = new CardRecord();
    c = c.sub('xyz', sub => sub.tag('Name', 'Test'));
    expect((c.cards.get('xyz') as CardRecord).name).toEqual('Test');
});

it('tags sub card partially', () => {
    let c = new CardRecord();
    c = c.sub('xyz', sub => sub.tag({ name: 'Name', value: 'Test' }));
    expect((c.cards.get('xyz') as CardRecord).name).toEqual('Test');
});

it('tags source value', () => {
    const c = new CardRecord().tag({
        name: 'Product',
        value: 'Blue Stamp',
        quantity: 1,
        amount: 5,
        source: 'Book'
    });
    expect(c.balance).toEqual(5);
});

it('tranfers tag value', () => {
    const c = new CardRecord().tag({
        name: 'Product',
        value: 'Blue Stamp',
        quantity: 1,
        amount: 5,
        source: 'Book',
        target: 'Other Book'
    });
    expect(c.balance).toEqual(0);
});

it('sums multiple card balances', () => {
    let c = new CardRecord();
    c = c.sub('1', card => card.tag({
        name: 'Product',
        value: 'Blue Stamp',
        quantity: 1,
        amount: 5,
        source: 'Book'
    }));
    c = c.sub('2', card => card.tag({
        name: 'Product',
        value: 'Green Stamp',
        quantity: 1,
        amount: 10,
        source: 'Book'
    }));
    expect(c.balance).toEqual(15);
});

it('can add validation issue', () => {
    let c = new CardRecord();
    c = c.addValidationIssue('TEST');
    const m = c.validationIssues.first();
    expect(m).toEqual('TEST');
})

it('calculates discount', () => {
    let c = new CardRecord();
    c = c.tag({
        name: 'Product',
        value: 'Blue Stamp',
        quantity: 1,
        amount: 10,
        source: 'Book'
    })
    c = c.tag({
        name: 'Discount',
        amount: 10,
        func: '-(p*a)/100',
        source: 'Discount',
    })
    expect(c.balance).toEqual(9);
});

it('handles modifier tags', () => {
    let c = new CardRecord();
    c = c.tag({
        name: 'Product',
        value: 'Blue Stamp',
        quantity: 1,
        amount: 10,
        source: 'Book'
    })
    c = c.tag({
        name: 'Modifier',
        amount: 1,
        quantity: 1
    })
    expect(c.masterTag).not.toBeUndefined();
    const mt = c.masterTag as CardTagRecord;
    expect(mt.isModifier).toBe(false);
    expect(c.balance).toEqual(11);
});