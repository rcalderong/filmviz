export const flattenArray = array => [].concat(...array);

export const chunkArray = (array, chunkSize) => {
  const chunksNumber = Math.ceil(array.length / chunkSize);
  return Array.from({ length: chunksNumber }).map((x, i) => {
    const firstIndex = i * chunkSize;
    return array.slice(firstIndex, firstIndex + chunkSize);
  });
};

export const lastInArray = array => array[array.length - 1];

export const mergeObjects = objects =>
  objects.reduce(
    (prevMerge, object) => ({
      ...prevMerge,
      ...object,
    }),
    {}
  );

export const runSequentially = (items, itemFn) =>
  items.reduce(async (prevPromise, item, index) => {
    const prevReturn = await prevPromise;
    return itemFn(prevReturn, item, index);
  }, Promise.resolve());

export const mapToPromise = (fnsArray, ...args) =>
  Promise.all(fnsArray.map(fn => fn(...args)));

export const cancellablePromise = promise => {
  let shouldCancel = false;

  return (() => {
    const promiseWithCancel = promise(() => shouldCancel);
    promiseWithCancel.cancel = () => {
      shouldCancel = true;
    };
    return promiseWithCancel;
  })();
};

export const toNumberWithDecimals = (decimalPlaces, number) =>
  +Number.parseFloat(number).toFixed(decimalPlaces);

export const getProcessorThreads = () => navigator.hardwareConcurrency;

export const now = () => new Date() / 1000;
