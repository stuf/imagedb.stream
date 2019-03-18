import * as K from 'kefir';
import * as I from 'infestines';
import * as R from 'kefir.ramda';
import * as U from 'karet.util';

import * as A from './utils';
import * as H from './helpers';
import { takeChunkedGlobAsync, getImageMeta } from './files';
import { validateConfig } from './validate';
import initDb, { getCollection } from './database';

import mkLogger from './log';

const log = mkLogger('main');

function init(config) {
  log.info('Application startup');
  log.info('Validating configuration');

  const errs = validateConfig(config);
  if (!!errs) {
    log.fatal(`Configuration validation failed; ${JSON.stringify(errs)}`)
    process.exit(1);
  }

  log.info('Configuration is valid.');
  log.info('- paths = [%s]', config.paths.join(', '))
  log.info('- globPattern = %s', config.fileGlob);
  log.info('- concurrency = %s', config.concurrency);
  log.info('- chunkSize = %s', config.fileGlobChunkSize);
  log.info('- mongoDBHost = %s', config.mongo.host);
  log.info('- mongoDBName = %s', config.mongo.dbName);

  log.info('Start file lookup');

  const patterns = config.paths.map(p => A.joinPath2(p, config.fileGlob));

  // Collect matching files and turn them into manageable batches.
  const filesChunked$ = takeChunkedGlobAsync(patterns, config.fileGlobChunkSize);

  const fileFound$ = U.thru(
    filesChunked$,
    U.foldPast(
      (total, xs) => total + xs.length,
      0,
    ),
    U.tapPartial(count => log.info('Collected %s files', count)),
  );

  // fileFound$.log('count');

  const { client, db } = initDb(config);

  const dbFiles = getCollection('files', db);

  H.activate(U.sink(U.parallel([
    fileFound$,
    dbFiles,
  ])));
}

export default init;

