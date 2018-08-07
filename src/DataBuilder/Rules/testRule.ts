import { RuleRecord } from '../../models';

const data = {
    id: 'HJ4YemlXxX',
    name: 'Test Rule',
    content: `rule TestSelection {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'EXECUTE_COMMAND' && a.data.name == 'Test') from s.action;
        }
        then {
            r.add('ASK_QUESTION', {
                tag: 'Test',
                question: 'Test question',
                parameters: {
                    'Section 1': 'edit me',
                    'Section 2': 10,
                    'Section 3': ['Value 1', 'Value 2'],
                    'Section 4': {
                        selected: 'Value 1',
                        values: ['Value 1', 'Value 2 10.00=Value 2', 'Value 3'],
                        max: 2
                    },
                    'Section 5': {
                        selected: 'Value 1',
                        values: [{
                                caption: 'Value first',
                                value: 'Value 1'
                            },
                            {
                                value: 'Value 2',
                                amount: 10
                            },
                            {
                                value: 'Value 3',
                                quantity: 1,
                                max: 2,
                            }
                        ],
                        max: 2,
                        min: 2
                    }
                }
            });
        }
    }
    
    rule getResult {
        when {
            r: Result;
            s: State;
            a: Action(a.type == 'ASK_QUESTION' && a.data.tag === 'Test') from s.action;
        }
        then {
            let message = '';
            const values = s.get('selectedValues');
            for (const key of Object.keys(values)) {
                message = message + key + ' > ' + values[key] + '\n';
            }
            alert(message);
        }
    
    }`
};

export default new RuleRecord(data);