import * as Y from 'yjs';

function rtop(request: any) {
  return new Promise(function (resolve: any, reject: any) {
    request.onerror = function (event: any) {
      reject(new Error(event.target.error));
    };
    request.onblocked = function () {
      location.reload();
    };
    request.onsuccess = function (event: any) {
      resolve(event.target.result);
    };
  });
}

function openDB(room: string) {
  return new Promise(function (resolve: any, reject: any) {
    const request = indexedDB.open(room);
    // window.r1 = request;
    request.onupgradeneeded = function (event: any) {
      const db = event.target.result;
      if (db.objectStoreNames.contains('model')) {
        db.deleteObjectStore('updates');
        db.deleteObjectStore('model');
        db.deleteObjectStore('custom');
      }
      db.createObjectStore('updates', {
        autoIncrement: true
      });
      db.createObjectStore('model');
      db.createObjectStore('custom');
    };
    request.onerror = function (event: any) {
      reject(new Error(event.target.error));
    };
    request.onblocked = function () {
      location.reload();
    };
    request.onsuccess = function (event: any) {
      const db = event.target.result;
      db.onversionchange = function () {
        db.close();
      };
      resolve(db);
    };
  });
}

const PREFERRED_TRIM_SIZE = 500;

// tslint:disable-next-line:interface-over-type-literal
type AbstractPersistenceType = { new(opts: any) };

export class IndexedDBPersistence extends (Y.AbstractPersistence as AbstractPersistenceType) {
  constructor(opts: any) {
    super(opts);
    window.addEventListener('unload', () => {
      this.ys.forEach(function (cnf: any, y: any) {
        if (cnf.db !== null) {
          cnf.db.close();
        } else {
          cnf._db.then(db => db.close());
        }
      });
    });
  }
  public init(y: any) {
    const cnf = this.ys.get(y);
    const room = y.room;
    cnf.db = null;
    const dbOpened = openDB(room);
    dbOpened.then(db => {
      cnf.db = db;
    });
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
    return dbOpened;
  }

  public deinit(y: any) {
    const cnf = this.ys.get(y);
    cnf.db.close();
    super.deinit(y);
  }

  public set(y: any, key: any, value: any) {
    const cnf = this.ys.get(y);
    const t = cnf.db.transaction(['custom'], 'readwrite');
    const customStore = t.objectStore('custom');
    return rtop(customStore.put(value, key));
  }

  public get(y: any, key: any) {
    const cnf = this.ys.get(y);
    const t = cnf.db.transaction(['custom'], 'readwrite');
    const customStore = t.objectStore('custom');
    return rtop(customStore.get(key));
  }

  /**
   * Remove all persisted data that belongs to a room.
   * Automatically destroys all Yjs all Yjs instances that persist to
   * the room. If `destroyYjsInstances = false` the persistence functionality
   * will be removed from the Yjs instances.
   */
  public removePersistedData(room: any, destroyYjsInstances: boolean = true) {
    super.removePersistedData(room, destroyYjsInstances);
    return rtop(indexedDB.deleteDatabase(room));
  }

  public saveUpdate(y: any, update: any) {
    const cnf = this.ys.get(y);
    if (cnf.channel !== null) {
      cnf.channel.postMessage(update);
    }
    const t = cnf.db.transaction(['updates'], 'readwrite');
    const updatesStore = t.objectStore('updates');
    updatesStore.put(update);
    const cntP = rtop(updatesStore.count());
    cntP.then(cnt => {
      if (cnt >= PREFERRED_TRIM_SIZE) {
        this.persist(y);
      }
    });
  }

  public saveStruct(y: any, struct: any) {
    super.saveStruct(y, struct);
  }

  public retrieve(y: any) {
    const cnf = this.ys.get(y);
    const t = cnf.db.transaction(['updates', 'model'], 'readonly');
    const modelStore = t.objectStore('model');
    const updatesStore = t.objectStore('updates');
    return Promise.all([rtop(modelStore.get(0)), rtop(updatesStore.getAll())])
      .then(([model, updates]) => {
        super.retrieve(y, model, updates);
      });
  }

  public persist(y: any) {
    const cnf = this.ys.get(y);
    const db = cnf.db;
    const t = db.transaction(['updates', 'model'], 'readwrite');
    const updatesStore = t.objectStore('updates');
    return rtop(updatesStore.getAll())
      .then((updates: any) => {
        // apply pending updates before deleting them
        Y.AbstractPersistence.prototype.retrieve.call(this, y, null, updates);
        // get binary model
        const binaryModel = Y.AbstractPersistence.prototype.persist.call(this, y);
        // delete all pending updates
        if (updates.length > 0) {
          const modelStore = t.objectStore('model');
          modelStore.put(binaryModel, 0);
          updatesStore.clear();
        }
      });
  }
}

export default function extendYIndexedDBPersistence(y: any) {
  y.IndexedDB = IndexedDBPersistence;
  return IndexedDBPersistence;
}