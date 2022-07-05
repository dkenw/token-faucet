import { fetchJson } from 'ethers/lib/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useChainId } from './useChainId'

export interface TokenData {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
}

export const useTokens = (tokenListUrl: string | undefined): TokenData[] | undefined => {
  const [tokens, setTokens] = useState<TokenData[] | undefined>(undefined)

  const ref = useRef<string | undefined>()
  ref.current = tokenListUrl

  useEffect(() => {
    if (!tokenListUrl) {
      setTokens(undefined)
      return
    }

    fetchJson(tokenListUrl)
      .then((data) => {
        if (ref.current === tokenListUrl) setTokens(data.tokens)
      })
      .catch((error) => {
        if (ref.current === tokenListUrl) {
          console.log('fetch list error', tokenListUrl, error)
          setTokens(undefined)
        }
      })
  }, [tokenListUrl])

  const chainId = useChainId()

  return useMemo(() => {
    if (!tokens) return undefined
    if (!chainId) return undefined
    return tokens.filter((token) => token.chainId === chainId)
  }, [tokens, chainId])
}
