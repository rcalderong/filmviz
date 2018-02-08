import { now, toNumberWithDecimals } from './utils';

export const getStats = ({ analysisStart, analyzedSamples, totalSamples }) => {
  const elapsedTime = now() - analysisStart;
  const timeLeft =
    elapsedTime * (totalSamples - analyzedSamples) / analyzedSamples;
  const percentageCompleted = analyzedSamples / totalSamples * 100;

  return {
    timeLeft: Math.round(timeLeft),
    percentageCompleted: toNumberWithDecimals(1, percentageCompleted),
  };
};
