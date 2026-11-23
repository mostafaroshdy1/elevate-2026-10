import type { FastifyReply, FastifyRequest } from "fastify";
import type { PostService } from "./post.service";
import type { CreatePostInput, UpdatePostInput } from "./post.entity";
import Redis from "ioredis";
const redis = new Redis({ db: 6 });
export class PostController {
  constructor(private readonly service: PostService) {}

  async list(_request: FastifyRequest, _reply: FastifyReply) {
    const route = _request.url;
    const cachedData = await redis.get(route);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const result = await this.service.list();
    await redis.set(route, JSON.stringify(result));
    return result;
  }

  async get(
    request: FastifyRequest<{ Params: { id: string } }>,
    _reply: FastifyReply,
  ) {
    return this.service.get(Number(request.params.id));
  }

  async create(
    request: FastifyRequest<{ Body: CreatePostInput }>,
    reply: FastifyReply,
  ) {
    const post = await this.service.create(request.body);
    return reply.code(201).send(post);
  }

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdatePostInput }>,
    _reply: FastifyReply,
  ) {
    return this.service.update(Number(request.params.id), request.body);
  }

  async remove(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    await this.service.remove(Number(request.params.id));
    return reply.code(204).send();
  }
}
