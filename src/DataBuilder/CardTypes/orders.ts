import { CardTypeRecord } from '../../models';
import orderProduct from '../TagTypes/orderProduct';
import orderDiscount from '../TagTypes/orderDiscount';
import orderModifiers from './orderModifiers';

const data = {
    id: 'BJd0lPfsz',
    name: 'Orders',
    reference: 'Order',
    color: 'cornflowerblue',
    commands: ['Edit Card'],
    subCardTypes: [orderModifiers.id],
    tagTypes: [orderProduct.id, orderDiscount.id]
};

// id: string;
// name: string;
// reference: string;
// displayFormat: string;
// commands: string[];
// tagTypes: string[];
// subCardTypes: string[];

export default new CardTypeRecord(data);
