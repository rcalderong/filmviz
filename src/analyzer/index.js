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
  getStats,
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

    if (onAnalyzedSample) {
      onAnalyzedSample({ data: sampleData, ...getStats() });
    }

    return [...data, sampleData];
  });
};

const getChunksPerThread = ({ samplingTimes, threadsNumber }) =>
  chunkArray(samplingTimes, Math.ceil(samplingTimes.length / threadsNumber));

const analyze = (
  url,
  analyzers,
  { from = 0, to, interval = DEFAULT_SAMPLING_INTERVAL_SECS, callback } = {}
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

    const samplingTimes = Array.from(
      { length: totalSamples },
      (x, i) => from + i * interval
    );
    const samplingTimesChunks = getChunksPerThread({
      samplingTimes,
      threadsNumber: DEFAULT_THREADS_NUMBER,
    });
    const resultChunks = await Promise.all(
      samplingTimesChunks.map(
        analyzeSamples({
          url,
          analyzers,
          interval,
          onAnalyzedSample: callback,
          getStats: getStatsForSample,
          shouldCancel,
        })
      )
    );

    return flattenArray(resultChunks);
  });

export default analyze;
