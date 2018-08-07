import { RuleRecord } from '../../models';

const data = {
    id: 'Sy_87lXem',
    name: 'New Card Props',
    content: `rule SetNewModifierProps {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'CREATE_CARD' && a.data.type == 'Modifier Groups') from s.action;
        }
        then {
            r.add('ASK_QUESTION', {
                question: 'Enter Name & Items',
                tag: 'New Modifier Group',
                parameters: {
                    'Name': '',
                    'Items': {
                        values: [],
                        lines: 7
                    }
                }
            });
        }
    }
    
    rule SetModifiers {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'ASK_QUESTION' && a.data.tag == 'New Modifier Group') from s.action;
        }
        then {
            r.add('SET_CARD_TAG', {
                name: 'Name',
                value: s.getValue('Name')
            });
            const itemsEntry = s.getValues('Items');
            const items = itemsEntry ? itemsEntry.split(/\\n/).filter(x => x.trim()) : [];
            for (const item of items) {
                r.add('CREATE_CARD', {
                    type: 'Modifier'
                });
                r.add('SET_CARD_TAG', {
                    name: 'Name',
                    value: item
                });
                r.resetParent(s.root.id);
            }
        }
    }
    
    rule SetCustomerProps {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'CREATE_CARD' && a.data.type == 'Customers') from s.action;
        }
        then {
            console.log('state', s);
            r.add('EDIT_CARD', {
                title: 'Add New Customer',
                tag: 'New Customer',
                card: s.card
            });
        }
    }`
};

export default new RuleRecord(data);