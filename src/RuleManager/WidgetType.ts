import { Widget } from "../models";
import CardManager from "../CardManager";
import * as moment from 'moment';

export class WidgetType {
    public widgets: Widget[];

    constructor() {
        this.widgets = [];
    }

    public get cm(): any {
        return CardManager;
    }

    public get moment(): any {
        return moment;
    }

    public clear() {
        while (this.widgets.length > 0) {
            this.widgets.pop();
        }
    }

    public add(widget: Widget) {
        this.widgets.push(widget);
    }
}