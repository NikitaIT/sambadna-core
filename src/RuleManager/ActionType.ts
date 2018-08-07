export class ActionType {
    public data: any;
    public type: string;
    public params: {};
    constructor(type: string, data: any) {
        this.type = type;
        this.data = data || {};
        this.params = this.data.params;
    }
}