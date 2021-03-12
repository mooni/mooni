import { captureError } from './analytics'
import { MetaError, serializeError } from './errors'

export function log(...args) {
  console.log(...args)
}
export function logError(message: string, error?: Error | MetaError) {
  if (!error) error = new Error()
  console.error(message, error, serializeError(error))
  captureError(message, error)
}
