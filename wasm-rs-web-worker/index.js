const uploadInput = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const counter = document.getElementById("counter");
const applyButton = document.getElementById("applyButton");

let worker;

applyButton.addEventListener("click", () => {
  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const worker = new Worker("worker.js", { type: "module" });

  enableCounter();
  runCounter();

  worker.postMessage(
    { data: imageData.data, width: canvas.width, height: canvas.height },
    [imageData.data.buffer]
  );

  worker.addEventListener(
    "message",
    ({ data }) => {
      const newImageData = new ImageData(
        new Uint8ClampedArray(data),
        canvas.width,
        canvas.height
      );

      context.putImageData(newImageData, 0, 0);
      stopCounter();
    },
    { once: true }
  );
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
