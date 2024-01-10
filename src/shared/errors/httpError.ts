export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}

export function badRequestError(message: string): HttpError {
  return new HttpError(message, 400);
}

export function notFoundError(message: string): HttpError {
  return new HttpError(message, 404);
}

export function internalServerError(message: string): HttpError {
  return new HttpError(message, 500);
}

export function isHttpError(object: any): object is HttpError {
  return (
    object &&
    typeof object.message === "string" &&
    typeof object.statusCode === "number" &&
    object.name === "HttpError"
  );
}
