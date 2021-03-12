import React, { useEffect, useRef } from 'react'
import { debounce } from 'lodash'

const scrollRootStyle = {
  height: 'calc(var(--vh, 1vh) * 100)',
  overflowY: 'scroll',
}

function setVHProperty(element) {
  const vh = window.innerHeight * 0.01
  element.style.setProperty('--vh', `${vh}px`)
}

export default function ScrollRoot({ children }) {
  const scrollRootRef = useRef()

  useEffect(() => {
    if (scrollRootRef.current) {
      setVHProperty(scrollRootRef.current)
      const debounced = debounce(() => setVHProperty(scrollRootRef.current), 200)
      window.addEventListener('resize', debounced)
      return () => window.removeEventListener('resize', debounced)
    }
  }, [scrollRootRef])

  return (
    <div style={scrollRootStyle} ref={scrollRootRef}>
      {children}
    </div>
  )
}
