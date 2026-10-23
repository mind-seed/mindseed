export class ServiceError extends Error {
  constructor(
    readonly statusCode: number,
    readonly errorCode: string,
  ) {
    super();
  }
}
