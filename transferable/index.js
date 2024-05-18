// set some constants/vars
const SIZE = 1024 * 1024 * 1024; // 1024MB for our data
let arrayBuffer = null;
let uInt8View = null;
let originalLength = null;

const buttonTransferable = document.querySelector("#buttonTransferable");
const buttonCopy = document.querySelector("#buttonCopy");

window.addEventListener("load", init);

buttonTransferable.addEventListener("click", () => test(true));
buttonCopy.addEventListener("click", () => test(false));

//
// Initial
let worker = null;
let startTime = 0;

function init() {
  worker = new Worker("worker.js");

  worker.postMessage({});

  worker.addEventListener("message", (e) => {
    let elapsed;

    if (!e.data.type) {
      elapsed = seconds(startTime);
    }

    const data = e.data;

    if (data.type && data.type == "debug") {
      log(data.msg);
    } else {
      if (data.copy) {
        data.byteLength = data.ourArray.byteLength;
      }
      const rate = Math.round(toMB(data.byteLength) / elapsed);
      log(source() + "postMessage roundtrip took: " + elapsed * 1000 + " ms");
      log(source() + "postMessage roundtrip rate: " + rate + " MB/s");
    }
  });

  log(source() + "We are good to go!");
}

function test(useTransferrable) {
  setupArray(); // Need to do this on every run for the repeated runs with transferable arrays. They're cleared out after they're transferred.

  startTime = new Date();
  console.time("actual postMessage round trip was");

  if (useTransferrable) {
    console.log(
      "## Using Transferrable object method on size: " + uInt8View.length
    );
    worker.postMessage(uInt8View.buffer, [uInt8View.buffer]);
  } else {
    console.log("## Using old COPY method on size: " + uInt8View.length);
    worker.postMessage({ copy: "true", ourArray: uInt8View.buffer }); //uInt8View.buffer
  }
}

// build our example array of 1024MB numbers
// later in the worker we will work on them with some simple math operations
function setupArray() {
  arrayBuffer = new ArrayBuffer(SIZE);
  uInt8View = new Uint8Array(arrayBuffer);
  originalLength = uInt8View.length;

  for (let i = 0; i < originalLength; ++i) {
    uInt8View[i] = i;
  }

  log(source() + "filled " + toMB(originalLength) + " MB buffer");
}

function log(str) {
  document.querySelector("#result").innerHTML += `${time()} ${str} \n`;
}

// return time stamp
function time() {
  const now = new Date();
  let time = /(\d+:\d+:\d+)/.exec(now)[0] + ":";
  let ms;
  for (ms = String(now.getMilliseconds()), i = ms.length - 3; i < 0; ++i) {
    time += "0";
  }
  return time + ms;
}

function seconds(since) {
  return (new Date() - since) / 1000.0;
}

function toMB(bytes) {
  return Math.round(bytes / 1024 / 1024);
}

// We are now our page (on the worker will have some nice RED color for the answers)
function source() {
  return '<span style="color:green;">Our page:</span> ';
}
