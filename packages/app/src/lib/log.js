import { captureError} from './analytics';

export function log(...args) {
  console.log(...args);
}
export function logError(message, error) {
  console.error(message, error);
  captureError(message, error);
}
