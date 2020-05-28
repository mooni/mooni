import { captureError } from './analytics';
import { serializeError } from './errors';

export function log(...args) {
  console.log(...args);
}
export function logError(message, error) {
  console.error(message, error, serializeError(error));
  captureError(message, error);
}
