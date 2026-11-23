import Fastify from "fastify";
import { readFileSync } from "node:fs";
import { setTimeout } from "node:timers/promises";

const app = Fastify({
  logger: true,
  http2: true,
  https: {
    cert: readFileSync("./localhost.pem"),
    key: readFileSync("./localhost-key.pem"),
  },
});

app.get("/hi", async (req, res) => {
  await setTimeout(10_000);
  return "Hello, world!";
});

app.listen({ port: 5000 });

class User {
  id!: number;
  name!: string;
  email!: string;
  constructor(id: number, name: string, email: string) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  toJSON() {
    return {
      id: this.id,
    };
  }
}

const Ahmed = new User(1, "Ahmed", "ahmed@example.com");

const AhmedJson = JSON.stringify(Ahmed);

console.log(AhmedJson);
