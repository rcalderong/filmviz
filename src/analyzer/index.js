import { createVideo, getTotalTime, grabSample } from './video';
import {
  getArrayOf,
  runSequentially,
  mapToPromise,
  cancellablePromise,
  arrayIntoChunks,
  flattenArray,
  mergeObjects,
  getProcessorThreads,
  now,
} from './utils';
import { getStats } from './stats';

const DEFAULT_PROCESSING_THREADS = 2;
const DEFAULT_SAMPLING_INTERVAL = 1;

const analyzeSample = async ({ video, analyzers, time }) => {
  const image = await grabSample({ video, time });
  const data = await mapToPromise(analyzers, image);

  return { time, ...mergeObjects(data) };
};

const analyzeSamples = ({
  url,
  analyzers,
  onAnalyzedSample,
  getStats,
  shouldCancel,
}) => async times => {
  const video = await createVideo(url);

  return runSequentially(times, async (time, data = []) => {
    if (shouldCancel()) {
      return Promise.reject();
    }

    const sampleData = await analyzeSample({ video, analyzers, time });

    const stats = getStats();
    if (onAnalyzedSample) {
      onAnalyzedSample({ data: sampleData, ...stats });
    }

    return [...data, sampleData];
  });
};

const getChunksPerThread = samplingTimes => {
  const processingThreads = getProcessorThreads() || DEFAULT_PROCESSING_THREADS;

  return arrayIntoChunks(
    samplingTimes,
    Math.ceil(samplingTimes.length / processingThreads)
  );
};

const analyze = (
  url,
  analyzers,
  { from = 0, to, interval = DEFAULT_SAMPLING_INTERVAL, callback } = {}
) =>
  cancellablePromise(async shouldCancel => {
    const analysisStart = now();

    const totalTime = await getTotalTime(url);
    const totalSamples = Math.floor((to || totalTime - from) / interval);

    let analyzedSamples = 0;
    const getStatsForSample = () => {
      analyzedSamples++;

      return getStats({
        analysisStart,
        analyzedSamples,
        totalSamples,
      });
    };

    const samplingTimes = getArrayOf(
      totalSamples,
      (x, i) => from + i * interval
    );
    const samplingTimesChunks = getChunksPerThread(samplingTimes);
    const resultChunks = await Promise.all(
      samplingTimesChunks.map(
        analyzeSamples({
          url,
          analyzers,
          onAnalyzedSample: callback,
          getStats: getStatsForSample,
          shouldCancel,
        })
      )
    );

    return {
      data: flattenArray(resultChunks),
      ...getStats({
        analysisStart,
        analyzedSamples,
        totalSamples,
      }),
    };
  });

export default analyze;
