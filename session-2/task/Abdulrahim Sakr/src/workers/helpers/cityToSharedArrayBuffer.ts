export const cityToSharedArrayBuffer = (count: number) => {
  const sharedBuffer = new SharedArrayBuffer(
    count * Float64Array.BYTES_PER_ELEMENT,
  );

  const temperatures = new Float64Array(sharedBuffer);

  return {
    sharedBuffer,
    temperatures,
  };
};