export function createCityData(count: number): Float64Array<SharedArrayBuffer> {
  const fields = 4;
  const data = new Float64Array(new SharedArrayBuffer(count * fields * Float64Array.BYTES_PER_ELEMENT));
  for (let i = 0; i < count; i++) {
    const offset = i * fields;
    data[offset] = i + 1;
    data[offset + 1] = Math.random() * 180 - 90;
    data[offset + 2] = Math.random() * 360 - 180;
    data[offset + 3] = Math.floor(Math.random() * 46) - 10;
  }
  return data;
}
