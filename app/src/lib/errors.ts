export class MetaError {
  readonly _metaError: boolean = true;
  message: string;
  meta: any;

  constructor(message: string, meta: object = {}) {
    this.message = message;
    this.meta = meta;
  }

  toObject(): object  {
    return {
      _metaError: true,
      message: this.message,
      meta: this.meta,
    }
  }
}

export class APIError extends MetaError {
  readonly _apiError: boolean = true;
  code: number;
  description?: string;

  constructor(code: number, message: string, description?: string, meta: object = {}) {
    super(message, meta);
    this.code = code;
    this.description = description;
  }

  toObject(): object {
    return Object.assign({}, super.toObject(), {
      _apiError: true,
      code: this.code,
      description: this.description,
    });
  }
}

export function serializeError(error: any) {
  if(typeof error.toObject === 'function') return error.toObject();
  const obj = {
    message: error.message,
    code: error.code,
    stack: error.stack?.toString(),
    ...error,
  };
  const ser = JSON.stringify(obj, null, 2);
  return ser;
}
