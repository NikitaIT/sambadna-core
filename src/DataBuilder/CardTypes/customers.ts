import { CardTypeRecord } from '../../models';
import CustomerPhone from '../TagTypes/customerPhone';
import CustomerName from '../TagTypes/customerName';
import CustomerAddress from '../TagTypes/customerAddress';

const data = {
    id: 'r1QA8MK5z',
    name: 'Customers',
    reference: 'Customer',
    tagTypes: [CustomerName.id, CustomerPhone.id, CustomerAddress.id]
};

// id: string;
// name: string;
// reference: string;
// displayFormat: string;
// commands: string[];
// tagTypes: string[];
// subCardTypes: string[];

export default new CardTypeRecord(data);
