import { CardTypeRecord } from '../../models';
import productModifier from '../TagTypes/productModifier';

const data = {
    id: 'ryiVIZP1m',
    name: 'Product Modifier References',
    reference: 'Product Modifier Reference',
    tagTypes: [productModifier.id]
};

// id: string;
// name: string;
// reference: string;
// displayFormat: string;
// commands: string[];
// tagTypes: string[];
// subCardTypes: string[];

export default new CardTypeRecord(data);
