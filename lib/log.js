import * as R from 'kefir.ramda';
import * as D from 'date-fns/fp';
import * as I from 'infestines';
import C from 'colors/safe';
import { format } from 'util';

//

const formatTimestamp = R.pipe(
  R.constructN(1, Date),
  R.tap(x => ({ x, x_: x.toISOString() })),
  D.format('DDD-HH:mm:ss'),
);

const LogLevel = {
  info: {
    levelFormat: C.green,
  },
  warn: {
    levelFormat: C.yellow,
  },
  error: {
    levelFormat: R.o(C.red, R.toUpper),
  },
  fatal: {
    levelFormat: R.compose(C.red, C.bold, R.toUpper),
    action: () => process.exit(1),
  },
};

function log(context, level, ...args) {
  const prefix = context;
  const ts = formatTimestamp(new Date());

  const logLevelObj = LogLevel[level];
  const logLevelFn = logLevelObj ? logLevelObj.levelFormat : a => a;

  const action = logLevelObj && logLevelObj.action;

  console.log(logLevelFn(level), ts, prefix, format(...args));

  if (action) {
    action();
  }
}

const mkLogLevel = I.curry(function mkLogLevel(level, logFn) {
  return logFn.bind(null, level);
});

export function mkLogger(context, levels = LogLevel) {
  const logLevels = R.toPairs(levels);

  const logger = log.bind(null, context);

  logLevels.forEach(([k, level]) => {
    logger[k] = mkLogLevel(k, logger);
  });

  return logger;
}

export default mkLogger;
