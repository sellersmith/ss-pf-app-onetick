// App-local color picker ported for OneTick styling to avoid TailorKit UI imports.
import { useEffect, useMemo, useRef } from 'react'

export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay?: number
): (...args: TArgs) => void {
  const callbackRef = useRef(callback)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debounced = useMemo(() => {
    if (!delay || delay <= 0) {
      return (...args: TArgs) => {
        callbackRef.current(...args)
      }
    }

    return (...args: TArgs) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }
  }, [delay])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return debounced
}
