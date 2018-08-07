import * as Y from 'yjs';
import { ICommit } from './models';

export class SubNetwork {
    public networkName: string;
    public commitProtocol: any;
    private yInstance: any;

    constructor(networkName: string, yInstance: any, onCommitEvent: (commits: ICommit[]) => void) {
        this.networkName = networkName;
        this.yInstance = yInstance;
        this.commitProtocol = yInstance.define('commits', Y.Array);

        this.commitProtocol.observe(event => {
            const elements: any[] = Array.from(event.addedElements);
            const commits = elements.reduce(
                (r: ICommit[], e) => {
                    r.push(...e._content);
                    return r;
                },
                [] as ICommit[]);
            onCommitEvent(commits);
        });
    }

    public disconnect() {
        this.yInstance.destroy();
    }
}