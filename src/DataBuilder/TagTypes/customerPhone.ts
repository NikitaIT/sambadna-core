import { TagTypeRecord } from '../../models';

const data = {
    id: 'S1Jz8_Piz',
    name: 'Customer Phone',
    tagName: 'Phone',
    mask: '( [1-9] \\d \\d ) _ \\d \\d \\d - \\d \\d \\d \\d',
    showValue: true,
    showCategory: false,
    showQuantity: false,
    showUnit: false,
    showAmount: false,
    showSource: false,
    showTarget: false,
    showFunction: false,
    icon: 'phone'
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