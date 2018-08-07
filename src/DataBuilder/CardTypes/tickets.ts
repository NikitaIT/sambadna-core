import { CardTypeRecord } from '../../models';
import orders from './orders';
import ticketTable from '../TagTypes/ticketTable';
import ticketCustomer from '../TagTypes/ticketCustomer';
import ticketStatus from '../TagTypes/ticketStatus';
import ticketDiscount from '../TagTypes/ticketDiscount';
import payments from './payments';

const data = {
    id: 'SJGEsS5cM',
    name: 'Tickets',
    reference: 'Ticket',
    commands: ['Payment=Add Payment', 'Table=Select Table', 'Add Product:Products,Category'],
    subCardTypes: [orders.id, payments.id],
    tagTypes: [ticketTable.id, ticketCustomer.id, ticketStatus.id, ticketDiscount.id]
};

// id: string;
// name: string;
// reference: string;
// displayFormat: string;
// commands: string[];
// tagTypes: string[];
// subCardTypes: string[];

export default new CardTypeRecord(data);
