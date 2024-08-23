import { expect, test } from 'vitest';

import { expandFlattenObject, flattenObject } from '../flatten-object';

test('flatten-object', () => {
  const ob = {
    a: {
      b: {
        c: 1,
      },
    },
    d: 2,
  };
  const result = flattenObject(ob);
  expect(result).toEqual({
    'a.b.c': 1,
    d: 2,
  });
});

test('expend flatten-object', () => {
  const ob = {
    'a.b.c': 1,
    d: 2,
  };
  const result = expandFlattenObject(ob);
  expect(result).toEqual({
    a: {
      b: {
        c: 1,
      },
    },
    d: 2,
  });
});
