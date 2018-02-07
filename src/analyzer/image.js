export const createImageFromDataUrl = dataUrl => {
  const image = new Image();
  image.src = dataUrl;

  return new Promise(resolve => {
    image.onload = () => {
      resolve(image);
    };
  });
};
