import { now, toNumberWithDecimals } from './utils';

export const getStats = ({ analysisStart, analyzedSamples, totalSamples }) => {
  const elapsedTime = now() - analysisStart;
  const timeRemaining =
    elapsedTime * (totalSamples - analyzedSamples) / analyzedSamples;
  const percentageCompleted = analyzedSamples / totalSamples * 100;

  return {
    elapsedTime: Math.round(elapsedTime),
    timeRemaining: Math.round(timeRemaining),
    percentageCompleted: toNumberWithDecimals(1, percentageCompleted),
  };
};
