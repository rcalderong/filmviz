import {
  flattenArray,
  chunkArray,
  lastInArray,
  mergeObjects,
  toNumberWithDecimals,
  mapToPromise,
  runSequentially,
  cancellablePromise,
} from './utils';

describe('flattenArray', () => {
  test('shallow', () => {
    const actual = flattenArray([[1, 2], [3, 4, 5]]);
    const expected = [1, 2, 3, 4, 5];
    expect(actual).toEqual(expected);
  });

  test('deep', () => {
    const actual = flattenArray([[1, 2], [3, [4, 5]]]);
    const expected = [1, 2, 3, 4, 5];
    expect(actual).toEqual(expected);
  });

  test('no input', () => {
    const actual = flattenArray();
    const expected = [];
    expect(actual).toEqual(expected);
  });
});

describe('chunkArray', () => {
  test('larger than chunk size', () => {
    const actual = chunkArray([1, 2, 3, 4, 5], 2);
    const expected = [[1, 2], [3, 4], [5]];
    expect(actual).toEqual(expected);
  });

  test('smaller than chunk size', () => {
    const actual = chunkArray([1, 2], 3);
    const expected = [[1, 2]];
    expect(actual).toEqual(expected);
  });

  test('no input', () => {
    const actual = chunkArray();
    const expected = [];
    expect(actual).toEqual(expected);
  });
});

describe('lastInArray', () => {
  test('input', () => {
    const actual = lastInArray([1, 2, 3]);
    const expected = 3;
    expect(actual).toBe(expected);
  });

  test('no input', () => {
    const actual = lastInArray();
    const expected = undefined;
    expect(actual).toBe(expected);
  });
});

describe('mergeObjects', () => {
  test('shallow', () => {
    const actual = mergeObjects([{ a: 1 }, { b: 2, c: 3 }]);
    const expected = { a: 1, b: 2, c: 3 };
    expect(actual).toEqual(expected);
  });

  test('deep', () => {
    const actual = mergeObjects([{ a: 1 }, { b: 2, c: { d: 3 } }]);
    const expected = { a: 1, b: 2, c: { d: 3 } };
    expect(actual).toEqual(expected);
  });

  test('no input', () => {
    const actual = mergeObjects();
    const expected = {};
    expect(actual).toEqual(expected);
  });
});

describe('runSequentially', () => {
  test('all inputs', () => {
    const accMultipliedByPos = (acc = 0, x, i) => acc + x * (i + 1);

    const actual = runSequentially([2, 4, 6], accMultipliedByPos);
    const expected = 28;
    expect(actual).resolves.toEqual(expected);
  });

  test('non-returning function input', () => {
    const actual = runSequentially([2, 4, 6], x => {});
    const expected = undefined;
    expect(actual).resolves.toEqual(expected);
  });

  test('no input function', () => {
    const actual = runSequentially([2, 4, 6]);
    const expected = undefined;
    expect(actual).resolves.toEqual(expected);
  });

  test('no input items', () => {
    const actual = runSequentially();
    const expected = undefined;
    expect(actual).resolves.toEqual(expected);
  });
});

describe('mapToPromise', () => {
  test('single argument', () => {
    const actual = mapToPromise([x => x * 2, x => x * 3], 5);
    const expected = [10, 15];
    expect(actual).resolves.toEqual(expected);
  });

  test('multiple arguments', () => {
    const actual = mapToPromise(
      [(x, y) => x * y * 2, (x, y) => x * y * 3],
      5,
      6
    );
    const expected = [60, 90];
    expect(actual).resolves.toEqual(expected);
  });

  test('no input', () => {
    const actual = mapToPromise();
    const expected = [];
    expect(actual).resolves.toEqual(expected);
  });
});

describe('cancellablePromise', () => {
  const return5 = () => Promise.resolve(5);

  test('no cancellation', async () => {
    const actual = await cancellablePromise(return5);
    const expected = 5;
    expect(actual).toEqual(expected);
  });
});

describe('toNumberWithDecimals', () => {
  test('string input', () => {
    const actual = toNumberWithDecimals(1, 123.478);
    const expected = 123.5;
    expect(actual).toBe(expected);
  });

  test('number input', () => {
    const actual = toNumberWithDecimals(2, '123.478');
    const expected = 123.48;
    expect(actual).toBe(expected);
  });

  test('no input', () => {
    const actual = toNumberWithDecimals();
    const expected = NaN;
    expect(actual).toEqual(expected);
  });
});
