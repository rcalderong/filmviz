import { createVideo, getTotalTime, grabSample } from './video';
import {
  runSequentially,
  mapToPromise,
  cancellablePromise,
  chunkArray,
  flattenArray,
  mergeObjects,
  getProcessorThreads,
  now,
  lastInArray,
} from './utils';
import { getStats } from './stats';

const DEFAULT_THREADS_NUMBER = getProcessorThreads() || 2;
const DEFAULT_SAMPLING_INTERVAL_SECS = 1;

const analyzeSample = async ({ video, analyzers, interval, time, accData }) => {
  const image = await grabSample({ video, time });
  const prevImage = accData.length
    ? lastInArray(accData).image
    : await grabSample({ video, time: time - interval });

  const data = await mapToPromise(analyzers, image, prevImage);

  return { time, image, ...mergeObjects(data) };
};

const analyzeSamples = ({
  url,
  analyzers,
  interval,
  onAnalyzedSample,
  shouldCancel,
}) => async times => {
  const video = await createVideo(url);

  return runSequentially(times, async (data = [], time, index) => {
    const sampleData = await analyzeSample({
      video,
      analyzers,
      interval,
      time,
      accData: data,
    });

    if (shouldCancel()) {
      return Promise.reject();
    }

    onAnalyzedSample(sampleData);
    return [...data, sampleData];
  });
};

const getSamplingTimesChunks = ({ from, interval, totalSamples, threads }) => {
  const samplingTimes = Array.from(
    { length: totalSamples },
    (x, i) => from + i * interval
  );

  return chunkArray(samplingTimes, samplingTimes.length / threads);
};

const getTotalSamples = async ({ url, from, to, interval }) => {
  const totalTime = await getTotalTime(url);
  return Math.floor((to || totalTime - from) / interval);
};

const analyze = (
  url,
  analyzers,
  {
    from = 0,
    to,
    interval = DEFAULT_SAMPLING_INTERVAL_SECS,
    threads = DEFAULT_THREADS_NUMBER,
    callback,
  } = {}
) =>
  cancellablePromise(async shouldCancel => {
    const analysisStart = now();

    const totalSamples = await getTotalSamples({ url, from, to, interval });

    let analyzedSamples = 0;
    const onAnalyzedSample = data => {
      analyzedSamples++;
      const stats = getStats({ analysisStart, totalSamples, analyzedSamples });
      callback({ data, ...stats });
    };

    const samplingTimesChunks = getSamplingTimesChunks({
      from,
      interval,
      totalSamples,
      threads: threads,
    });
    const resultChunks = await Promise.all(
      samplingTimesChunks.map(
        analyzeSamples({
          url,
          analyzers,
          interval,
          onAnalyzedSample,
          shouldCancel,
        })
      )
    );

    return flattenArray(resultChunks);
  });

export default analyze;
