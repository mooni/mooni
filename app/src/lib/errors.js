export class MetaError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.meta = meta;
  }
}

export function serializeError(error = {}) {
  const obj = {
    message: error.message,
    code: error.code,
    stack: error.stack.toString(),
    ...error,
  };
  const ser = JSON.stringify(obj, null, 2);
  return ser;
}
