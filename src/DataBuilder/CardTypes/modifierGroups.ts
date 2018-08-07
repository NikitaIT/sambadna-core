import { CardTypeRecord } from '../../models';
import modifiers from './modifiers';

const data = {
    id: 'HymJ1-vk7',
    name: 'Modifier Groups',
    reference: 'Modifier Group',
    subCardTypes: [modifiers.id],
};

// id: string;
// name: string;
// reference: string;
// displayFormat: string;
// commands: string[];
// tagTypes: string[];
// subCardTypes: string[];

export default new CardTypeRecord(data);
