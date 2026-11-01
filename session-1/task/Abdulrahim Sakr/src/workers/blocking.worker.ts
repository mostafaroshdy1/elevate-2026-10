function runBlock() {
  const start = performance.now();
  console.log(`[${new Date().toTimeString().slice(0, 8)}] Block:start`);
  while (performance.now() - start < 20_000) {}
  console.log(`[${new Date().toTimeString().slice(0, 8)}] Block:end`);
  setTimeout(() => {
    runBlock();
  }, 20_000);
}

setTimeout(() => {
  runBlock();
}, 10_000);
