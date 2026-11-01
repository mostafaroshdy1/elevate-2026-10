import { pbkdf2 } from "node:crypto";
const password = "mypassword";
const salt = "mysalt";
const iterations = 200000;
const keylen = 32;
const digest = "sha256";

let start = performance.now();
let end = 0;
let counter = 0;

for (let index = 0; index < 8; index++) {
  pbkdf2(password, salt, iterations, keylen, digest, (error, derivedKey) => {
    console.log({ error });
    console.log({ derivedKey });
    end = performance.now();
    counter++;

    if (counter === 8) {
      const totalTime = end - start;
      console.log(`Total time: ${totalTime} ms`);
    }
  });
}

setInterval(() => {
  console.log("HeartBeat");
}, 100);
