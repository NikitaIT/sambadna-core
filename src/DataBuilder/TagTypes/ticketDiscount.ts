import { TagTypeRecord } from '../../models';

const data = {
    id: 'B1YlXTjsz',
    name: 'Ticket Discount',
    tagName: 'Discount',
    showValue: false,
    defaultValue: 'Ticket Discount',
    showCategory: false,
    showQuantity: false,
    showUnit: false,
    showAmount: true,
    showSource: false,
    showTarget: false,
    showFunction: false,
    icon: '_',
    defaultFunction: '-(d*a)/100',
    defaultSource: 'Discount'
};

// id: string;
// name: string;
// tagName: string;
// cardTypeReferenceName: string;
// showValue: boolean;
// showQuantity: boolean;
// showUnit: boolean;
// showAmount: boolean;
// showSource: boolean;
// showTarget: boolean;
// showFunction: boolean;
// sourceCardTypeReferenceName: string;
// targetCardTypeReferenceName: string;
// displayFormat: string;
// icon: string;
// defaultFunction: string;
// defaultValue: string;
// defaultSource: string;
// defaultTarget: string;
// defaultQuantity: number;
// defaultUnit: string;
// defaultAmount: number;

export default new TagTypeRecord(data);