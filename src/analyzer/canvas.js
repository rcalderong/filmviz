import { createImageFromDataUrl } from './image';

const MAX_SIZE = 200;

const getAspectRatio = video => {
  const { videoWidth, videoHeight } = video;
  return videoWidth / videoHeight;
};

const getCanvasSize = ({ video, canvas }) => {
  const aspectRatio = getAspectRatio(video);

  return {
    width: aspectRatio > 1 ? MAX_SIZE : MAX_SIZE / aspectRatio,
    height: aspectRatio > 1 ? MAX_SIZE / aspectRatio : MAX_SIZE,
  };
};

const drawImageInCanvas = ({ video, canvas, ctx }) => {
  const { width, height } = getCanvasSize({ video, canvas });

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
};

const getDataUrlFromCanvas = (canvas, { format }) => canvas.toDataURL(format);

export const getImageFromVideo = ({
  video,
  format = 'image/jpg',
  canvas,
  ctx,
}) => {
  drawImageInCanvas({ video, canvas, ctx });
  const dataUrl = getDataUrlFromCanvas(canvas, { format });
  return createImageFromDataUrl(dataUrl);
};

export const createCanvas = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};
