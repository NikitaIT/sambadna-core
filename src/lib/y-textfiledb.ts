/* global indexedDB, location, BroadcastChannel */
import * as Y from 'yjs';
import * as fs from 'fs';

let FILE_NAME = './model.db';
const PREFERRED_TRIM_SIZE = 5;
let updates: any[] = [];

// tslint:disable-next-line:interface-over-type-literal
type AbstractPersistenceType = { new(opts: any) };

export class TextFileDBPersistence extends (Y.AbstractPersistence as AbstractPersistenceType) {
  constructor(opts: any) {
    super(opts);
    console.log('text file persistence enabled');
  }
  public init(y: any) {
    const cnf = this.ys.get(y);
    const room = y.room;
    FILE_NAME = `./${room}.db`;
    if (typeof BroadcastChannel !== 'undefined') {
      cnf.channel = new BroadcastChannel('__yjs__' + room);
      cnf.channel.addEventListener('message', e => {
        cnf.mutualExclude(function () {
          y.transact(function () {
            Y.utils.integrateRemoteStructs(y, new Y.utils.BinaryDecoder(e.data));
          });
        });
      });
    } else {
      cnf.channel = null;
    }
    return new Promise(r => r());
  }

  public deinit(y: any) {
    super.deinit(y);
  }

  public removePersistedData(room: string, destroyYjsInstances: boolean = true) {
    super.removePersistedData(room, destroyYjsInstances);
    return new Promise((resolve, reject) =>
      fs.unlink(FILE_NAME, (err) => {
        if (err) {
          reject();
        }
        resolve();
      })
    );
  }

  public saveUpdate(y: any, update: any) {
    const cnf = this.ys.get(y);
    if (cnf.channel !== null) {
      cnf.channel.postMessage(update);
    }

    updates.push(update);
    if (updates.length >= PREFERRED_TRIM_SIZE) {
      this.persist(y);
    }
  }

  public persist(y: any) {
    Y.AbstractPersistence.prototype.retrieve.call(this, y, null, updates);
    const binaryModel = Y.AbstractPersistence.prototype.persist.call(this, y);
    fs.writeFile(FILE_NAME, new Buffer(binaryModel), err => {
      if (err) {
        // tslint:disable-next-line:no-console
        fs.unlink(FILE_NAME, (error) => { console.log(error); });
      }
    });
    updates = [];

    // let cnf = this.ys.get(y)
    // let db = cnf.db
    // let t = db.transaction(['updates', 'model'], 'readwrite')
    // let updatesStore = t.objectStore('updates')
    // return rtop(updatesStore.getAll())
    //   .then(updates => {
    //     // apply pending updates before deleting them
    //     Y.AbstractPersistence.prototype.retrieve.call(this, y, null, updates)
    //     // get binary model
    //     let binaryModel = Y.AbstractPersistence.prototype.persist.call(this, y)
    //     // delete all pending updates
    //     if (updates.length > 0) {
    //       let modelStore = t.objectStore('model')
    //       modelStore.put(binaryModel, 0)
    //       updatesStore.clear()
    //     }
    //   })
  }

  public saveStruct(y: any, struct: any) {
    super.saveStruct(y, struct);
  }

  public retrieve(y: any) {
    fs.readFile(FILE_NAME, null, (err, nb) => {
      let model;
      if (nb) { model = nb.buffer; }
      super.retrieve(y, model, updates);
    });
  }
}

export default function extendYTextFileDBPersistence(y: any) {
  y.TextFileDB = TextFileDBPersistence;
  return TextFileDBPersistence;
}