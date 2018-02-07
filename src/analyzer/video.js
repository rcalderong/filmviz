import { getImageFromVideo, createCanvas } from './canvas';

let videoIndex = 0;
const canvasObjectByIndex = {};

const addCanvasForVideo = canvasObj => {
  videoIndex += 1;
  canvasObjectByIndex[videoIndex] = canvasObj;
  return videoIndex;
};

const getCanvasForIndex = videoIndex => canvasObjectByIndex[videoIndex];

const setIndexForVideo = video => {
  video.index = addCanvasForVideo(createCanvas());
};

const getIndexFromVideo = video => video.index;

const goToPosition = ({ video, time }) => {
  if (video.currentTime === time) {
    return Promise.resolve();
  }

  video.currentTime = time;
  return new Promise(resolve => {
    video.onseeked = resolve;
  });
};

export const grabSample = async ({ video, time, format }) => {
  await goToPosition({ video, time });

  const videoIndex = getIndexFromVideo(video);
  const canvasObj = getCanvasForIndex(videoIndex);
  return getImageFromVideo({ video, format, ...canvasObj });
};

export const getTotalTime = async url => {
  const video = await createVideo(url, { shouldCreateCanvas: false });
  return video.duration;
};

export const createVideo = (url, { shouldCreateCanvas = true } = {}) => {
  const video = document.createElement('video');
  video.src = url;
  if (shouldCreateCanvas) {
    setIndexForVideo(video);
  }

  return new Promise(resolve => {
    video.oncanplay = () => {
      resolve(video);
    };
  });
};
