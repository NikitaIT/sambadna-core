import { RuleRecord } from '../../models';

const data = {
    id: 'r1rg-9HeX',
    name: 'Build Widgets',
    content: `rule BuildWidgets {
        when {
            r: Widgets;
            s: State;
            a: Action(a.type == 'GET_WIDGETS') from s.action;
        }
        then {
            const isToday = function(r, time) {
                const t1 = r.moment().startOf('day');
                const t2 = r.moment().endOf('day');
                return r.moment(time).isBetween(t1, t2);
            };
    
            const isYesterday = function(r, time) {
                const t1 = r.moment().add(-1, 'day').startOf('day');
                const t2 = r.moment().add(-1, 'day').endOf('day');
                return r.moment(time).isBetween(t1, t2);
            };
    
            const fmt = function(num) {
                const v = num < 10 ? '0' + num : num;
                return v + ':00';
            };
    
            const yesterdayCards = r.cm.queryCards('Tickets', c => isYesterday(r, c.time), c => r.moment(c.time).format('H'));
            const todaycards = r.cm.queryCards('Tickets', c => isToday(r, c.time), c => r.moment(c.time).format('H'));
    
            const startOfDay = 7;
            const range = Array.from(new Array(24), (x, i) => i + startOfDay - (i + startOfDay < 24 ? 0 : 24));
    
            const data = range.map(x => ({
                name: fmt(x),
                today: (todaycards[x] || []).length,
                yesterday: (yesterdayCards[x] || []).length
            }));
    
            const widget = new Widget();
            const count = data.reduce((r, c) => r + c.today, 0);
            widget.key = 'TotalWidgetKey';
            widget.title = 'Ticket Count: ' + count;
            widget.data = data;
            widget.addWidgetLegend('yesterday', '#82ca9d', 1);
            widget.addWidgetLegend('today', '#8884d8', 3);
            r.add(widget);
    
            const totalData = range.map(x => ({
                name: fmt(x),
                today: todaycards[x] ? todaycards[x].reduce((r, c) => r + c.debit, 0) : 0,
                yesterday: yesterdayCards[x] ? yesterdayCards[x].reduce((r, c) => r + c.debit, 0) : 0
            }));
    
            const totalWidget = new Widget();
            const total = totalData.reduce((r, c) => r + (c.today || 0), 0).toFixed(2);
            totalWidget.key = 'TicketTotalWidget';
            totalWidget.title = 'Ticket Total: $' + total;
            totalWidget.data = totalData;
            totalWidget.addWidgetLegend('yesterday', '#82ca9d', 1);
            totalWidget.addWidgetLegend('today', '#8884d8', 3);
            r.add(totalWidget);
    
            const openCards = r.cm.queryCards('Tickets', c => isToday(r, c.time) && c.balance !== 0, c => 'all');
            if (openCards.all) {
                const openCardCount = openCards.all.length;
                const openCardTotal = openCards.all.reduce((r, c) => r + c.balance, 0);
    
                const openCardWidget = new Widget();
                openCardWidget.key = 'OpenCardWidget';
                openCardWidget.title = openCardCount + ' Open Tickets: $' + openCardTotal.toFixed(2);
                r.add(openCardWidget);
            }
        }
    }`
};

export default new RuleRecord(data);