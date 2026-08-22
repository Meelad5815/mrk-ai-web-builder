export class PublicError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
    this.name = 'PublicError';
  }
}

export function toPublicError(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof PublicError) {
    return { message: error.message, status: error.status };
  }
  return { message: fallback, status: 500 };
}
