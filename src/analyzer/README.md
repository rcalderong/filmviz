# Analyzer

## API

```
analyzer(url, analyzers, options);
```

* **Params**

  * **`url`**: [Object url](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) of the video to be analyzed.
  * **`analyzers`**: Array of functions to be run for every sample. They receive an image and must return a promise that resolves to an object.
  * **`options`**: Optional object with the following keys
    * **`from`**: Video second to start the analysis (defaults to 0).
    * **`to`**: Video second to finish the analysis (defaults to the duration of the video).
    * **`interval`**: Video seconds between samples (defaults to 1).
    * **`callback`**: Function to be called on every analyzed sample. It receives an object with the data of the analyzed sample (`data`), as well as stats of the current progress of the analysis (`elapsedTime`, `timeRemaining`, `percentageCompleted`).

* **Returns** a promise that resolves when the analysis is finished or rejects if it's cancelled. It also has a `cancel()` method to cancel the analysis.

## Examples

### Analysis

#### Basic

```js
analyzer('/video.mp4', [mainColorAnalyzer]).then(({ data, elapsedTime }) => {
  console.log(`Analysis took ${elapsedTime} seconds`);
  console.log(
    `Predominant color at 10th sample (${data[10].time} seconds): ${
      data[10].color
    }`
  );
});
```

#### With callback

```js
analyzer('/video.mp4', [mainColorAnalyzer], {
  from: 10,
  to: 20,
  interval: 2,
  callback: ({ data, elapsedTime, timeRemaining, percentageCompleted }) => {
    console.log(
      `${percentageCompleted}% has been analyzed in ${elapsedTime} seconds`
    );
    console.log(`Estimated time remaining is ${timeRemaining} seconds`);
  },
});
```

#### With cancellation

```js
const analysis = analyzer('/video.mp4', [mainColorAnalyzer]).catch(() => {
  console.log('Analysis has been cancelled');
});

analysis.cancel(); // Makes the `analysis` promise to reject
```

### Analyzer function

```js
const mainColorAnalyzer = image => new Promise(resolve => {
  const mainColor = ... // Do analysis
  return {color: mainColor};
});
```
