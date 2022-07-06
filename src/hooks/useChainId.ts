import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useNetwork } from 'wagmi'

/**
 * Return a ref that stores the latest chainId. It does not trigger re-render.
 */
const useMetaMaskChainId = (onChange?: (chainId: number) => void) => {
  const mmChainId = useRef<number | undefined>()

  const handleChainChanged = useCallback(
    (chainIdStr: string) => {
      const chainId = parseInt(chainIdStr)
      mmChainId.current = chainId
      if (onChange) onChange(chainId)
    },
    [onChange]
  )

  useEffect(() => {
    const ethereum = window.ethereum
    if (ethereum && ethereum.isMetaMask) {
      ethereum.request({ method: 'eth_chainId' }).then(handleChainChanged)

      if (ethereum.on) {
        ethereum.on('chainChanged', handleChainChanged)
        return () => {
          if (ethereum.removeListener) ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [handleChainChanged])

  return mmChainId
}

/**
 * Use wagmi's hook. Fallback to metamask's hook if not connected
 */
export const useChainId = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const chainId = useNetwork().chain?.id
  const chainIdRef = useRef<number | undefined>()
  chainIdRef.current = chainId

  const mmChainId = useMetaMaskChainId(
    useCallback(() => {
      // if not connected (i.e. chainId == null), we force-update using metamask's chainId
      if (chainIdRef.current == null) {
        forceUpdate()
        console.log('force update chainId')
      }
    }, [])
  )

  return chainId ?? mmChainId.current
}
