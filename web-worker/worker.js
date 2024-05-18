addEventListener("message", ({ data }) => {
  const image = applyFilter(data);
  postMessage(image, [image.data.buffer]);
});

function applyFilter(data) {
  return applyGaussianBlur(applyInvertedColors(data));
}

// Gauss kernel 15x15
const KERNEL = [
  [2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 2],
  [4, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 8, 4],
  [5, 10, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 10, 10, 5],
  [5, 10, 13, 16, 16, 16, 16, 16, 16, 16, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 20, 20, 20, 20, 20, 20, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 20, 26, 26, 26, 26, 20, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 20, 26, 32, 32, 26, 20, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 20, 26, 32, 32, 26, 20, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 20, 26, 26, 26, 26, 20, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 20, 20, 20, 20, 20, 20, 16, 13, 10, 10, 5],
  [5, 10, 13, 16, 16, 16, 16, 16, 16, 16, 16, 13, 10, 10, 5],
  [5, 10, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 10, 10, 5],
  [4, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 8, 4],
  [4, 8, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 8, 8, 4],
  [2, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 2],
];
const KERNEL_SUM = KERNEL.flat().reduce((sum, val) => sum + val, 0);

function applyGaussianBlur(imageData) {
  const { data, width, height } = imageData;

  const tempData = new Uint8ClampedArray(data);

  const kernelSize = 15;
  const halfKernelSize = Math.floor(kernelSize / 2);

  for (let y = halfKernelSize; y < height - halfKernelSize; y++) {
    for (let x = halfKernelSize; x < width - halfKernelSize; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = -halfKernelSize; ky <= halfKernelSize; ky++) {
        for (let kx = -halfKernelSize; kx <= halfKernelSize; kx++) {
          const weight = KERNEL[ky + halfKernelSize][kx + halfKernelSize];
          const index = ((y + ky) * width + (x + kx)) * 4;
          r += data[index] * weight;
          g += data[index + 1] * weight;
          b += data[index + 2] * weight;
        }
      }

      const destIndex = (y * width + x) * 4;
      tempData[destIndex] = r / KERNEL_SUM;
      tempData[destIndex + 1] = g / KERNEL_SUM;
      tempData[destIndex + 2] = b / KERNEL_SUM;
    }
  }

  for (let i = 0; i < data.length; i++) {
    data[i] = tempData[i];
  }

  return imageData;
}

function applyInvertedColors(imageData) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i]; // Red
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
  }

  return imageData;
}
