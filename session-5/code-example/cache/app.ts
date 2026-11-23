import Redis from "ioredis";
const set = new Set();
set.add("someValue");
const redis = new Redis({ db: 9 });

await redis.hset("user:1", {
  name: "John Doe",
  age: 30,
});

await redis.hset("user:1", {
  class: "A",
});
