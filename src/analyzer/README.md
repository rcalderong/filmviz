# Analyzer

## API

```
analyze(url, options);
```

### Params

#### `url`

[Object url](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL) of the video to be analyzed.

#### `options`

Optional object with the following keys:

* **`from`**: Video second to start the analysis (defaults to 0)
* **`to`**: Video second to finish the analysis (defaults to duration of video)
* **`types`**: Array of types of analysis to be run on the video (defaults to all)
* **`interval`**: Video seconds between samples (defaults to 1)
* **`threads`**: Number of concurrent processes (defaults to computer cores)
* **`callback`**: Function to be called on every analyzed sample. It receives an object with:
  * **`percentageCompleted`** in %
  * **`timeLeft`** in seconds
  * **`data`** object with:
    * **`time`**: time of the sample in seconds
    * **`image`**: [ImageData](https://developer.mozilla.org/docs/Web/API/ImageData) of the sample
    * **`colors`, `motion`**: Results of the analysis of the sample

### Returns

* A promise that resolves to an array of `data` when the analysis is finished, or rejects if there's an error or it's cancelled
* It also has a `cancel()` method to cancel the analysis

## Examples

### Basic

```js
import analyze from './analyzer';

analyze('/video.mp4').then(data => {
  console.log('Analysis finished');

  const { time, colors, motion } = data[9];
  console.log(`Results of tenth sample (${time} seconds)`);
  console.log(`Color palette: ${colors}`);
  console.log(`Motion: ${motion}`);
});
```

### With options

```js
import analyze, { TYPES } from './analyzer';

analyze('/video.mp4', {
  from: 10,
  to: 20,
  types: [TYPES.MOTION],
  interval: 2,
  threads: 3,
  callback: ({ data, timeLeft, percentageCompleted }) => {
    const { time, colors } = data;
    console.log(`Motion at ${time} seconds: (${motion}`);
    console.log(`${percentageCompleted}% analized (${timeLeft} seconds left)`);
  },
});
```

### With cancellation

```js
import analyze from './analyzer';

const analysis = analyze('/video.mp4').catch(error => {
  console.log(error ? 'Error during analysis' : 'Analysis has been cancelled');
});

analysis.cancel(); // Makes the `analysis` promise to reject
```
