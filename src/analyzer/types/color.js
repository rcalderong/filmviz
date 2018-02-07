import RgbQuant from 'rgbquant';

export default image =>
  new Promise(resolve => {
    const q = new RgbQuant({
      colors: 16,
      minHueCols: 256,
    });

    q.sample(image);

    const colors = q.palette(true);

    resolve({ colors });
  });
