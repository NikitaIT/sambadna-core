import { Map as IMap } from 'immutable';
import { TagTypeRecord } from '../../models';

export default (): IMap<string, TagTypeRecord> => {
    let tagTypes: IMap<string, TagTypeRecord> = IMap<string, TagTypeRecord>();
    [
        'customerAddress',
        'customerName',
        'customerPhone',
        'orderDiscount',
        'orderProduct',
        'productModifier',
        'ticketCustomer',
        'ticketDiscount',
        'ticketStatus',
        'ticketTable'
    ].map(r => require('./' + r).default).forEach(tt => tagTypes = tagTypes.set(tt.id, tt));
    return tagTypes;
};