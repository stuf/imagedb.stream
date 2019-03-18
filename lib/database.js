import * as U from 'karet.util';
import * as K from 'kefir';
import * as I from 'infestines';

import M, { MongoClient } from 'mongodb';

import mkLogger from './log';

const log = mkLogger('database');

function init(config) {
  const _client = new MongoClient(config.mongo.host, { useNewUrlParser: true });
  const client = K.constant(_client);
  const connected = K.fromPromise(_client.connect());

  const ready = U.toProperty(K.combine([client, connected], a => a));
  const db = ready.flatMapLatest(c => K.constant(c.db(config.mongo.dbName)));

  return {
    client: ready,
    db,
  };
}

export default init;

//

export const getCollection = I.curry(
  /**
   * @param {string} name
   * @param {M.Db} db
   */
  function getCollection(name, db) {
    return U.thru(
      db,
      U.flatMapLatest(d => K.fromNodeCallback(cb => d.collection(name, cb))),
      U.toProperty,
      U.tapPartial(x => log.info('getCollection `%s`', name)),
    )
  },
);

export const insertMany = I.curry(
  /**
   *
   * @param {any} data
   * @param {M.Collection} collection
   */
  function insertMany(data, collection) {
    return U.thru(
      U.toProperty(collection),
      U.flatMapLatest(coll => K.fromPromise(coll.insertMany(data)))
    );
  }
);
