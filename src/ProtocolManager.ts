import { Map as IMap } from 'immutable';
import * as Y from 'yjs';
import * as _ from 'lodash';
import yclient from 'y-websockets-streaming-client';
import yindex from './lib/y-indexeddb';
import yText from './lib/y-textfiledb';
import { ICommit } from './models';
import CardManager from './CardManager';
import ConfigManager from './ConfigManager';
import { SubNetwork } from './SubNetwork';

export class ProtocolManager {
    private mainNetworkName;
    private url: string;
    private persistence: any;
    private onCommitEvent: (commits: ICommit[]) => void;
    private primaryNetwork: SubNetwork;
    private subNetworks: IMap<string, SubNetwork>;

    constructor() {
        yclient(Y);
        yindex(Y);
        yText(Y);
        this.subNetworks = IMap<string, SubNetwork>();
    }

    public connect(
        url: string,
        enablePersistence: boolean,
        terminalId: string,
        networkName: string,
        branchName: string,
        user: string,
        onConfigEvent: (config: Map<string, any>) => void,
        onCommitEvent: (commits: ICommit[]) => void
    ) {
        this.url = url;
        this.mainNetworkName = networkName;
        this.persistence = undefined;
        if (!networkName.includes('DEMO')) { this.persistence = enablePersistence ? new Y.IndexedDB() : new Y.TextFileDB(); }
        this.onCommitEvent = onCommitEvent;
        ConfigManager.setApplicationParameter('branch', branchName);
        const y = this.getYjsInstance(networkName);
        this.configurePrimaryNetwork(y, onConfigEvent);
        this.primaryNetwork = new SubNetwork(this.mainNetworkName, y, onCommitEvent);

        CardManager.integrateProtocol(
            commits => this.handleCommits(commits),
            (cardIds: string[]) => {
                const commitProtocol = this.getCommitProtocol('');
                for (let index = commitProtocol.length - 1; index >= 0; index--) {
                    const element = commitProtocol.get(index);
                    if (cardIds.indexOf(element.cardId) !== -1) {
                        commitProtocol.delete(index);
                    }
                }
            }
        );
    }

    private getNetworkNameOfCommit(commit: ICommit): string {
        const ccAction = commit.actions.find(x => !x.cardId && x.actionType === 'CREATE_CARD');
        if (ccAction) {
            const ct = ConfigManager.getCardTypeById(ccAction.data.typeId);
            if (ct) {
                return ct.network;
            }
        }
        const card = CardManager.getCardById(commit.cardId);
        if (card) {
            const ct = ConfigManager.getCardTypeById(card.typeId);
            if (ct) {
                return ct.network;
            }
        }
        return '';
    }

    private handleCommits(commits: ICommit[]) {
        const group = _.groupBy(commits, commit => this.getNetworkNameOfCommit(commit));
        const groupedCommits = IMap<string, any>(group);
        for (const key of groupedCommits.keySeq()) {
            this.getCommitProtocol(key).push(groupedCommits.get(key));
        }
    }

    private getCommitProtocol(subNetwork: string) {
        if (subNetwork) {
            let networkName = this.mainNetworkName + subNetwork;
            networkName = ConfigManager.replaceParameters(networkName);
            if (this.subNetworks.has(networkName)) {
                const sb = this.subNetworks.get(networkName);
                if (sb) { return sb.commitProtocol; }
            }
        }
        return this.primaryNetwork.commitProtocol;
    }

    private getYjsInstance(networkName) {
        return new Y(
            networkName, {
                connector: {
                    name: 'websockets-streaming-client',
                    url: this.url || 'https://pmpos-node.herokuapp.com/',
                    maxBufferLength: 500000
                }
            },
            this.persistence, { gc: true });
    }

    private disconnectSubnetworks() {
        for (const subNetwork of this.subNetworks.valueSeq()) {
            subNetwork.disconnect();
        }
        this.subNetworks = IMap<string, SubNetwork>();
    }

    private initSubNetworks(subNetworks: string[]) {
        this.disconnectSubnetworks();
        for (const subNetwork of subNetworks) {
            this.subNetworks =
                this.subNetworks.set(subNetwork, this.createSubNetwork(subNetwork));
        }
    }

    private createSubNetwork(networkName: string) {
        const y = this.getYjsInstance(networkName)
        return new SubNetwork(networkName, y, this.onCommitEvent);
    }

    private configurePrimaryNetwork(
        y: any,
        onConfigEvent: (config: Map<string, any>) => void) {

        const configProtocol = y.define('config', Y.Map);

        ConfigManager.integrateProtocol((name: string, data: IMap<string, any>) => {
            configProtocol.set(name, data.toJS());
        });

        configProtocol.observe(event => {
            const value = event.target;
            const config = value.keys().reduce((r, key) => r.set(key, value.get(key)), new Map<string, any>());
            ConfigManager.updateConfig(config);
            onConfigEvent(config);
            const subNetworks = ConfigManager.getSubNetworksFromCardTypes(this.mainNetworkName);
            this.initSubNetworks(subNetworks);
        });
    }

}

export default new ProtocolManager();