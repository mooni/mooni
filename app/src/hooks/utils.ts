import { useState, useEffect } from 'react'

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    },
    [value] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return debouncedValue
}
