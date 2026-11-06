export const sharedArrayBufferToCity = (
  sharedBuffer: SharedArrayBuffer,
  count: number,
): Float64Array => {
  return new Float64Array(sharedBuffer, 0, count);
};