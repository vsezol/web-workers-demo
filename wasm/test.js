// 1463.7999997138977s
WebAssembly.instantiateStreaming(fetch("test.wasm")).then((wasmModule) => {
  const wasmBindings = wasmModule.instance.exports;
  const start = performance.now();
  const result = wasmBindings.calc(2_000_000_000n);
  console.log(performance.now() - start, result);
});

// 15527.199999809265s
setTimeout(() => {
  const start = performance.now();
  let result = 0;
  for (let i = 0; i < 2_000_000_000n; i++) {
    result += i;
  }
  console.log(performance.now() - start, result);
}, 1000);
