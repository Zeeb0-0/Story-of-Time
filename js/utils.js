const loadImage = (src) => {
  console.log(`Attempting to load image: ${src}`);
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      console.log(`Successfully loaded image: ${src}`);
      resolve(img);
    }
    img.onerror = (e) => {
      console.error(`Error loading image ${src}:`, e);
      reject(new Error(`Failed to load image: ${src}`));
    }
    // Use absolute path when relative path doesn't work
    if (src.startsWith('./')) {
      img.src = src;
    } else {
      img.src = src;
    }
  })
}
