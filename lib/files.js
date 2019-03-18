import * as L from 'kefir.partial.lenses'
import * as I from 'infestines';
import * as R from 'kefir.ramda';
import * as K from 'kefir';
import * as G from 'fast-glob';
import * as X from 'shelljs';

import mkLogger from './log';

const log = mkLogger('files');

// GLOBS //////////////////////////////////////////////////////////////

/**
 * Take a number of glob patterns and return an observable property
 * of matching files.
 *
 * @param {string[]} globs
 * @param {number} chunkSize
 * @return {K.Property<string, any>}
 */
export const takeGlobAsync = (globs, chunkSize) => {
  const files = G.stream(globs);

  return K.fromEvents(files, 'data')
    .takeUntilBy(K.fromEvents(files, 'end'))
    .toProperty();
};

export const takeChunkedGlobAsync = (globs, chunkSize) => {
  const files = takeGlobAsync(globs);

  return files.bufferWithCount(chunkSize, { flushOnEnd: true });
}

// EXIFTOOL ///////////////////////////////////////////////////////////

/**
 * Run EXIFTool with the given arguments and return an observable
 * property of EXIFTool's output.
 */
export const runExifTool = I.curry(function runExifTool(file, args) {
  log.info('runExifTool on %s, args: (%s)', file, args.join(', '));

  const cmd = [
    'exiftool',
    ...args,
    file,
  ].join(' ');



  const res$ = K.stream(emitter => {
    const { stdout } = X.exec(cmd, { async: true, silent: true });
    stdout.on('error', e => {
      log.error('Process error', e);
      emitter.error(e);
      emitter.end();
    })

    stdout.on('data', data => {
      emitter.value(data);
    })

    stdout.on('end', () => {
      log.info('runExifTool finished on %s', file);
      emitter.end();
    });
  });

  return res$.scan(R.concat, '');
});

export const getImageMeta = function getImageMeta(file) {
  log.info('getImageMeta on %s', file);
  const args = ['-j', '-g'];

  const res = runExifTool(file, args);

  return res.map(L.get([L.json(), L.first])).filter(a => a);
};
