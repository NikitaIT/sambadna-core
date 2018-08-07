export class ContentType {
    public lines: string[];

    constructor() {
        this.lines = [];
    }

    public clear() {
        while (this.lines.length > 0) {
            this.lines.pop();
        }
    }

    public add(line: string) {
        this.lines.push(line);
    }
}