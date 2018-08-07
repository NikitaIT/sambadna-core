import { RuleRecord } from '../../models';

const data = {
    id: 'BklKxQlXlX',
    name: 'Payment Rules',
    content: `rule AskPayment {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'EXECUTE_COMMAND') from s.action;
            a: Action(a.data.name == 'Add Payment') from s.action;
        }
        then {
            r.add('ASK_QUESTION', {
                question: 'Enter Payment',
                tag: 'MyPayment',
                parameters: {
                    'type': [
                        'Cash',
                        'Credit Card',
                        'Voucher'
                    ],
                    'amount': Number(s.card.balance)
                }
            });
        }
    }
    
    rule SetPayment {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'ASK_QUESTION') from s.action;
            a: Action(a.data.tag == 'MyPayment') from s.action;
            s: State s.getValue('amount') !== 0 && s.getValue('type') !== '';
        }
        then {
            r.add('SET_CARD_TAG', {
                'value': 'Unpaid',
                'type': 'Ticket Status'
            });
            r.add('CREATE_CARD', {
                type: 'Payment'
            });
            const amount = s.getValue('amount');
            const location = amount > 0 ? 'target' : 'source';
            r.add('SET_CARD_TAG', {
                'value': s.getValue('type'),
                'amount': Math.abs(amount),
                [location]: 'Wallet.' + s.getValue('type')
            });
        }
    }`
};

export default new RuleRecord(data);