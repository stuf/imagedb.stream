import * as I from 'infestines';
import * as P from 'path';

export const K = I.curry(function K(x, y) {
  return y;
});

export const T = I.curry(function T(x, f) {
  return f(x);
});

export const W = I.curry(function W(f, x) {
  return f(x, x);
});

export const C = I.curry(function C(f, y, x) {
  return f(x, y);
});

export const B = I.curry(function B(f, g, x) {
  return f(g(x));
});

export const S = I.curry(function S(f, g, x) {
  return f(x, g(x));
});

export const joinPath2 = I.curry(function joinPath2(a, b) {
  return P.join(a, b);
});

//

/**
 * @param {Number} n
 * @param {K.Observable<any, any>} obs
 */
export const takeChunksOf = I.curry(function takeChunksOf(n, obs) {
  return obs.bufferWithCount(n, { flushOnEnd: true });
});
