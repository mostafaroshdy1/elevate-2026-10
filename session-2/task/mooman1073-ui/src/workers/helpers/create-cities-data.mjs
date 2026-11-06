export function createCitiesData(count) {
  const fieldsPerCity = 4;
  const buffer = new SharedArrayBuffer(
    count * fieldsPerCity * Float64Array.BYTES_PER_ELEMENT
  );
  const data = new Float64Array(buffer);

  for (let index = 0; index < count; index++) {
    const offset = index * fieldsPerCity;
    data[offset] = index + 1;
    data[offset + 1] = Math.random() * 180 - 90;
    data[offset + 2] = Math.random() * 360 - 180;
    data[offset + 3] = Math.floor(Math.random() * 46) - 10;
  }

  return data;
}
