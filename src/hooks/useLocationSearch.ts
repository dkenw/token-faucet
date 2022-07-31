import { useEffect, useMemo, useState } from 'react'

export const useQueryStringParams = () => {
  const [search, setSearch] = useState(window.location.search)

  useEffect(() => {
    const listener = () => {
      setSearch(window.location.search)
    }
    window.addEventListener('popstate', listener)
    return () => {
      window.removeEventListener('popstate', listener)
    }
  }, [])

  return useMemo(() => new URLSearchParams(search), [search])
}
