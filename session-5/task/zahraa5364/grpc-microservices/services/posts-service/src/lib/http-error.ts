export class HttpError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request") {
    super(400, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}
