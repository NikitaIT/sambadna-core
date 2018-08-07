import { RuleRecord } from '../../models';

const data = {
    id: 'r1UnX_rx7',
    name: '_Build Test Widget',
    content: `rule BuildTestWidget {
        when {
            r: Widgets;
            s: State;
            a: Action(a.type == 'GET_WIDGETS') from s.action;
        }
        then {
            const data = [{
                    name: '08:00',
                    today: 2,
                    yesterday: 1,
                    amt: 2400
                },
                {
                    name: '09:00',
                    today: 2,
                    yesterday: 2,
                    amt: 2210
                },
                {
                    name: '10:00',
                    today: 3,
                    yesterday: 3,
                    amt: 2290
                },
                {
                    name: '11:00',
                    today: 3,
                    yesterday: 5,
                    amt: 2000
                },
                {
                    name: '12:00',
                    today: 7,
                    yesterday: 5,
                    amt: 2181
                },
                {
                    name: '13:00',
                    today: 7,
                    yesterday: 6,
                    amt: 2500
                },
                {
                    name: '14:00',
                    today: 4,
                    yesterday: 3,
                    amt: 2100
                },
                {
                    name: '15:00',
                    yesterday: 3,
                    amt: 2100
                },
                {
                    name: '16:00',
                    yesterday: 2,
                    amt: 2100
                },
                {
                    name: '17:00',
                    yesterday: 2,
                    amt: 2100
                },
                {
                    name: '18:00',
                    yesterday: 4,
                    amt: 2100
                },
                {
                    name: '19:00',
                    yesterday: 8,
                    amt: 2100
                },
                {
                    name: '20:00',
                    yesterday: 9,
                    amt: 2100
                },
                {
                    name: '21:00',
                    yesterday: 6,
                    amt: 2100
                },
                {
                    name: '22:00',
                    yesterday: 3,
                    amt: 2100
                },
                {
                    name: '23:00',
                    yesterday: 3,
                    amt: 2100
                },
            ];
            const widget = new Widget();
            widget.title = 'Test Widget';
            widget.data = data;
            widget.addWidgetLegend('yesterday','#82ca9d',1);
            widget.addWidgetLegend('today','#8884d8',3);
            r.add(widget);
        }
    }`
};

export default new RuleRecord(data);