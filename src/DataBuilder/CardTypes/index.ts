import { Map as IMap } from 'immutable';
import { CardTypeRecord } from '../../models';

export default (): IMap<string, CardTypeRecord> => {
    let cardTypes: IMap<string, CardTypeRecord> = IMap<string, CardTypeRecord>();
    [
        'tickets',
        'customers',
        'locations',
        'modifierGroups',
        'modifiers',
        'orderModifiers',
        'orders',
        'payments',
        'products',
        'productModifierReferences',
        'tables'
    ].map(r => require('./' + r).default).forEach(ct => cardTypes = cardTypes.set(ct.id, ct));
    return cardTypes;
};