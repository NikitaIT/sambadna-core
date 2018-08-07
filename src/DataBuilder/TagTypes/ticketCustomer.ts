import { TagTypeRecord } from '../../models';

const data = {
    id: 'r15r-6cM',
    name: 'Ticket Customer',
    tagName: 'Customer',
    cardTypeReferenceName: 'Customer',
    showValue: true,
    showCategory: false,
    showQuantity: false,
    showUnit: false,
    showAmount: false,
    showSource: false,
    showTarget: false,
    showFunction: false,
    icon: 'person_outline'
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