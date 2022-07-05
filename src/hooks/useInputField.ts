import { ChangeEvent, useCallback, useRef, useState } from 'react'

export const useInputField = (
  initialValue: string,
  delayMs: number = 300
): [string, (e: ChangeEvent<HTMLInputElement>) => void] => {
  const [value, setValue] = useState(initialValue)

  const ref = useRef<ReturnType<typeof setTimeout> | undefined>()

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (ref.current != null) clearTimeout(ref.current)
      ref.current = setTimeout(() => setValue(e.target.value), delayMs)
    },
    [delayMs]
  )

  return [value, handleChange]
}
