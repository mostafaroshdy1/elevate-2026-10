import { pbkdf2 } from "node:crypto";
import { performance } from "node:perf_hooks";

const password = "my-password";
const salt = "my-salt";
const iterations = 200_000;
const keyLength = 64;
const digest = "sha512";

const start = performance.now();

let completed = 0;

const heartbeat = setInterval(() => {
    console.log("Heartbeat:", new Date().toISOString());
}, 100);

for (let i = 0; i < 8; i++) {
    pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        digest,
        (err, derivedKey) => {
            if (err) {
                console.error(err);
                return;
            }

            completed++;

            console.log(`Hash ${completed} completed`);

            if (completed === 8) {
                const elapsedMs = performance.now() - start;

                clearInterval(heartbeat);

                console.log("All hashes completed");
                console.log("Total time:", elapsedMs.toFixed(2), "ms");
                console.log(
                    "Average time per hash:",
                    (elapsedMs / 8).toFixed(2),
                    "ms"
                );
            }
        }
    );
}