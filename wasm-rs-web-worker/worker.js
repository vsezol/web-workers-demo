import init, { blur_and_invert } from "./pkg/wasm_rs.js";
init();

addEventListener("message", ({ data: payload }) => {
  init().then(() => {
    blur_and_invert(payload.data, payload.width, payload.height);
    postMessage(payload.data, [payload.data.buffer]);
  });

  // const image = applyFilter(data);
  // blur_and_invert(imageData.data, canvas.width, canvas.height);
  // postMessage(image, [image.data.buffer]);
});
