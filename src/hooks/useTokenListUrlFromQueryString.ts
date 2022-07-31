import { useEffect, useState } from 'react'

const DEFAULT_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/dkenw/token-list/master/tokenlist.json'

export const useTokenListUrlFromQueryString = () => {
  const [tokenListUrl, setTokenListUrl] = useState(() => {
    const search = new URLSearchParams(window.location.search)
    return search.get('url')
  })

  // set default if not found
  useEffect(() => {
    if (!tokenListUrl) {
      setTokenListUrl(DEFAULT_TOKEN_LIST_URL)

      const url = new URL(window.location.href)
      url.searchParams.set('url', DEFAULT_TOKEN_LIST_URL)
      window.history.replaceState({}, '', url)
    }
  }, [tokenListUrl])

  useEffect(() => {
    const listener = () => {
      const search = new URLSearchParams(window.location.search)
      setTokenListUrl(search.get('url'))
    }
    window.addEventListener('popstate', listener)
    return () => {
      window.removeEventListener('popstate', listener)
    }
  }, [])

  return tokenListUrl
}
