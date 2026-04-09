type BiMap<L extends string, R extends string> = {
  encode: (l: L) => R;
  decode: (r: R) => L;
};

export function createBiMap<L extends string, R extends string>(
  pairs: [L, R][],
): BiMap<L, R> {
  const forward = Object.fromEntries(pairs);
  const backward = Object.fromEntries(pairs.map(([l, r]) => [r, l]));
  return {
    encode: (l) => forward[l],
    decode: (r) => backward[r],
  };
}
