export interface IWidgetLegend {
    name: string;
    color: string;
    thickness: number;
}

export class Widget {
    public key: string;
    public title: string;
    public data: any;
    public legends: IWidgetLegend[];

    constructor() {
        this.legends = [];
    }

    public addWidgetLegend(name: string, color: string, thickness: number) {
        color = color || '#8884d8';
        thickness = thickness || 1;
        this.legends.push({
            name, color, thickness
        });
    }
}