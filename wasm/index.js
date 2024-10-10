const uploadInput = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const counter = document.getElementById("counter");
const applyButton = document.getElementById("applyButton");

applyButton.addEventListener("click", () => {
  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);

  WebAssembly.instantiateStreaming(fetch("index.wasm")).then((wasmModule) => {
    enableCounter();
    runCounter();

    const wasmBindings = wasmModule.instance.exports;

    const initialByteLength = imageData.data.byteLength;

    const wasmMemoryPagesCount = Math.ceil(initialByteLength / (64 * 1024));

    wasmBindings.growMemory(wasmMemoryPagesCount - 1);

    const memoryArray = new Uint8ClampedArray(wasmBindings.memory.buffer);
    console.log(structuredClone(imageData));

    // TODO compare with copying
    // memoryArray.set(new Uint8ClampedArray(imageData.data.buffer.transfer()));
    memoryArray.set(new Uint8ClampedArray(imageData.data.buffer));

    const start = performance.now();
    wasmBindings.invertColors(initialByteLength - 4);
    console.log(performance.now() - start);

    const newImageData = new ImageData(
      new Uint8ClampedArray(
        wasmBindings.memory.buffer.slice(0, initialByteLength)
      ),
      imageData.width,
      imageData.height
    );

    context.putImageData(newImageData, 0, 0);

    stopCounter();
  });
});

uploadInput.addEventListener("change", handleUpload);

function handleUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.addEventListener("load", (event) => {
    const img = new Image();

    img.addEventListener(
      "load",
      () => {
        createImageBitmap(img).then((bitmap) => {
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          context.drawImage(bitmap, 0, 0);
        });
      },
      { once: true }
    );

    img.src = event.target.result;
  });

  reader.readAsDataURL(file);
}

function applyFilter(data) {
  return applyInvertedColors(data);
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

// counter

let counterStartTime;
let isCounterActive = false;

function enableCounter() {
  counterStartTime = Date.now();
  counter.classList.add("visible");
  isCounterActive = true;
}

function stopCounter() {
  updateCounterText();
  isCounterActive = false;
}

function runCounter() {
  if (!isCounterActive) {
    return;
  }
  updateCounterText();
  requestAnimationFrame(runCounter);
}

function updateCounterText() {
  const elapsedTime = (Date.now() - counterStartTime) / 1000;
  counter.textContent = `${elapsedTime.toFixed(2)}`;
}

// const memory = new WebAssembly.Memory({ initial: 1 });

// function consoleLogString(offset, length) {
//   const bytes = new Uint8Array(memory.buffer, offset, length);
//   const string = new TextDecoder("utf8").decode(bytes);
//   console.log(string);
// }

// const importObject = {
//   console: { log: consoleLogString },
//   js: { mem: memory },
// };

// WebAssembly.instantiateStreaming(fetch("index.wasm"), importObject).then(
//   (obj) => {
//     obj.instance.exports.writeHi();
//   }
// );

// old try
// const wasmMemoryPagesCount = imageData.data.byteLength / (64 * 1024);

// const memory = new WebAssembly.Memory({
//   initial: wasmMemoryPagesCount,
// });
// const memoryArray = new Uint8ClampedArray(memory.buffer);
// // TODO compare with copying
// memoryArray.set(new Uint8ClampedArray(imageData.data.buffer.transfer()));

// const importObject = { js: { mem: memory } };
