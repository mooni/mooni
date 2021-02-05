export class MetaError {
  readonly _metaError: boolean = true;
  readonly name: string = 'MetaError';
  message: string;
  meta: any;

  constructor(message: string, meta?: object) {
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

  constructor(code: number, message: string, description?: string, meta?: object) {
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

export function serializeError(error: Error | MetaError) {
  let obj;

  if(error instanceof MetaError) {
    obj = error.toObject();
  }  else {
    obj = {
      stack: error.stack?.toString(),
      ...error,
    };
  }

  return JSON.stringify(obj, null, 2);
}
