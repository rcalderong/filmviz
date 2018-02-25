const MAX_SIZE = 200;

const drawImageInCanvas = ({ video, canvas, ctx }) => {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
};

const getImageFromCanvas = ({ canvas, ctx }) =>
  ctx.getImageData(0, 0, canvas.width, canvas.height);

export const getImageFromVideo = ({
  video,
  format = 'image/png',
  canvas,
  ctx,
}) => {
  drawImageInCanvas({ video, canvas, ctx });
  return getImageFromCanvas({ canvas, ctx });
};

const getAspectRatio = video => {
  const { videoWidth, videoHeight } = video;
  return videoWidth / videoHeight;
};

const getCanvasSize = video => {
  const aspectRatio = getAspectRatio(video);

  return {
    width: aspectRatio > 1 ? MAX_SIZE : MAX_SIZE / aspectRatio,
    height: aspectRatio > 1 ? MAX_SIZE / aspectRatio : MAX_SIZE,
  };
};

export const createCanvas = video => {
  const { width, height } = getCanvasSize(video);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  return { canvas, ctx };
};
