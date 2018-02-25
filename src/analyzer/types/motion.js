import pixelmatch from 'pixelmatch';
import { toNumberWithDecimals } from '../utils';

const getMotion = (image1, image2) => {
  const { width, height } = image1;

  const mismatchedPixels = pixelmatch(
    image1.data,
    image2.data,
    null,
    width,
    height
  );
  const totalPixels = width * height;

  return mismatchedPixels / totalPixels * 100;
};

export default (imageData, prevImageData) => {
  if (!prevImageData) return 0;

  const motion = getMotion(imageData, prevImageData);
  return { motion: toNumberWithDecimals(1, motion) };
};
