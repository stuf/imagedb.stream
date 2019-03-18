import * as I from 'infestines';

//

const _activationHelper = () => {};

export const activate = obs => obs.onEnd(_activationHelper);
export const deactivate = obs => obs.offEnd(_activationHelper);

//

export const keyValueLabel = I.curry(function keyValueLabel(len, text) {
  return text.concat(' ').padEnd(len, '.');
});

export const keyValue = I.curry(function keyValue(len, key, value) {
  const keyFn = keyValueLabel(len);

  return keyFn(key).concat(' ').concat(value);
});
