import { fetchJson } from 'ethers/lib/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TokenData } from './tokens'

type TokenListData = {
  logoURI?: string
  name: string
  timestamp: string
  version: { major: number; minor: number; patch: number }
  tokens: TokenData[]
}

export const useTokens = (
  tokenListUrl: string | undefined
): {
  data: TokenListData | undefined
  tokens: TokenData[] | undefined
  tokensByChainId: { [chainId: number]: TokenData[] } | undefined
} => {
  const [data, setData] = useState<TokenListData | undefined>(undefined)

  const ref = useRef<string | undefined>()
  ref.current = tokenListUrl

  useEffect(() => {
    if (!tokenListUrl) {
      setData(undefined)
      return
    }

    fetchJson(tokenListUrl)
      .then((data) => {
        if (ref.current === tokenListUrl) setData(data)
      })
      .catch((error) => {
        if (ref.current === tokenListUrl) {
          console.log('fetch list error', tokenListUrl, error)
          setData(undefined)
        }
      })
  }, [tokenListUrl])

  const tokens = data?.tokens

  const tokensByChainId = useMemo(() => {
    if (!tokens) return undefined
    const map: { [chainId: number]: TokenData[] } = {}
    tokens.forEach((token) => {
      const arr = map[token.chainId] ?? (map[token.chainId] = [])
      arr.push(token)
    })
    return map
  }, [tokens])

  return { data, tokens, tokensByChainId }
}
