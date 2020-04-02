export function isValue(v) {
  return (
    v !== null &&
    v !== false &&
    v !== undefined &&
    v !== '' &&
    !isNaN(v)
  )
}
export function isNotNull(v) {
  return (
    isValue(v) &&
    v !== 0 &&
    v !== '0'
  )
}
