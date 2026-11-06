import { parentPort } from 'node:worker_threads';

parentPort.on('message', ({ citiesData, requestId }) => {
  const fieldsPerCity = 4;
  const count = citiesData.length / fieldsPerCity;
  let sum = 0;

  for (let index = 3; index < citiesData.length; index += fieldsPerCity) {
    sum += citiesData[index];
  }

  parentPort.postMessage({
    requestId,
    meanTemperature: sum / count
  });
});
