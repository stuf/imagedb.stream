import * as R from 'kefir.ramda';
import * as V from 'kefir.partial.lenses.validation';

const isNonEmpty = R.identity;
const isString = R.is(String);
const isNumber = R.is(Number);

const Rule = {
  required: V.setError('required', isNonEmpty),
  mustBeString: V.setError('must be string', isString),
  mustBeNumber: V.setError('must be number', isNumber),
};

const mongoDbRules = V.props({
  host: Rule.mustBeString,
  dbName: Rule.mustBeString,
});

const configRules = V.props({
  fileGlobChunkSize: Rule.mustBeNumber,
  fileGlob: V.and(
    Rule.required,
    Rule.mustBeString,
  ),
  paths: V.arrayIx(Rule.mustBeString),
  concurrency: V.and(
    Rule.required,
    Rule.mustBeNumber,
  ),
  mongo: mongoDbRules,
});

export const validateConfig = config => V.errors(configRules, config);
