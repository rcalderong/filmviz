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
    * **`callback`**: Function to be called on every analyzed sample. It receives an object with the data of the analyzed sample, as well as the progress of the analysis.

* **Returns** a promise that resolves to an array of data when the analysis is finished, or rejects if there's an error or it's cancelled. It also has a `cancel()` method to cancel the analysis.

## Examples

### Analysis

#### Basic

```js
analyzer('/video.mp4', [mainColorAnalyzer]).then(data => {
  console.log(
    `Predominant color at 10th sample (${data[10].time} seconds): ${
      data[10].color
    }`
  );
});
```

#### With options

```js
analyzer('/video.mp4', [mainColorAnalyzer], {
  from: 10,
  to: 20,
  interval: 2,
  callback: ({ data, timeLeft, percentageCompleted }) => {
    console.log(`${percentageCompleted}% analized (${timeLeft} seconds left)`);
  },
});
```

#### With cancellation

```js
const analysis = analyzer('/video.mp4', [mainColorAnalyzer]).catch(error => {
  console.log(error ? 'Error during analysis' : 'Analysis has been cancelled');
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
