import RgbQuant from 'rgbquant';

const getColors = image => {
  const q = new RgbQuant({
    colors: 16,
    minHueCols: 256,
  });

  q.sample(image);

  return q.palette(true);
};

export default imageData => {
  const colors = getColors(imageData);
  return { colors };
};
