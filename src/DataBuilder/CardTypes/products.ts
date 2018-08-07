import { CardTypeRecord } from '../../models';
import productModifierReferences from './productModifierReferences';

const data = {
    id: 'HJJK7P6cG',
    name: 'Products',
    reference: 'Product',
    subCardTypes: [productModifierReferences.id]
};

// id: string;
// name: string;
// reference: string;
// displayFormat: string;
// commands: string[];
// tagTypes: string[];
// subCardTypes: string[];

export default new CardTypeRecord(data);
