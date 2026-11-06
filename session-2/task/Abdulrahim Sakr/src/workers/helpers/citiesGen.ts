import { cityToSharedArrayBuffer } from "./cityToSharedArrayBuffer.js";

export const citiesGen = (count: number): SharedArrayBuffer => {
  const { sharedBuffer, temperatures } =
    cityToSharedArrayBuffer(count);

  for (let i = 0; i < count; i++) {
    temperatures[i] = Math.random() * 50 - 10;
  }

  return sharedBuffer;
};