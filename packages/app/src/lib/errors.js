export default class MetaError extends Error {
  constructor(message, meta = {}) {
    super(message);
    Object.assign(this, meta);
  }
}
