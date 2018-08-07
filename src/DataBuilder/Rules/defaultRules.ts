import { RuleRecord } from '../../models';

const data = {
  id: 'rJFx7eQx7',
  name: 'Default Rules',
  content: `rule SetTicketNumber {
        when {
            r: Result;
            s: State;
            a: Action (a.type == 'COMMIT_CARD') from s.action;
            c: Card (c.name === '' && c.type == 'Tickets') from s.root;
        }
        then {
          r.add('SET_CARD_TAG',{
            'name'    : 'Name',
            'value'   : 'A' + s.padStart(s.count(c.type) + 1, 4, '0')
          });
        }
    }
    
    rule SetNewTicketState {
        when {
            r: Result;
            s: State;
            a: Action (a.type == 'CREATE_CARD' && a.data.type=='Tickets') from s.action;
        }
        then {
          r.add('SET_CARD_TAG',{
            'value'   : 'New Ticket',
            'type'    : 'Ticket Status'
          });
        }
    }
    
    rule SetUnpaidTicketState {
        when {
            r: Result;
            s: State;
            a: Action (a.type == 'COMMIT_CARD') from s.action;
            c: Card (c.getTagValue('Status','')=='New Orders' && c.balance > 0) from s.root;
        }
        then {
          r.add('SET_CARD_TAG',{
            'type'    : 'Ticket Status',
            'value'   : 'Unpaid'
          });
        }
    }
    rule SetPaidTicketState {
        when {
            r: Result;
            s: State;
            a: Action (a.type == 'COMMIT_CARD') from s.action;
            c: Card (c.getTagValue('Status','')!=='Paid' && c.balance == 0 && c.debit > 0) from s.root;
        }
        then {
          r.add('SET_CARD_TAG',{
            'type'    : 'Ticket Status',
            'value'   : 'Paid'
          });
          r.add('CLOSE_CARD');
        }
    }`
};

export default new RuleRecord(data);