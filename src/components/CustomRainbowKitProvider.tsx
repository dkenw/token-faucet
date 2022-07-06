import { lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { ReactNode, useMemo } from 'react'
import { Chain } from 'wagmi'
import { useChainId } from '../hooks/useChainId'

const rainbowKitTheme = lightTheme({
  accentColor: '#333',
  borderRadius: 'medium',
  fontStack: 'system',
})
rainbowKitTheme.shadows.connectButton = '0px 2px 6px rgba(0, 0, 0, 0.1)'

/**
 * Same as RainbowKitProvider, but will not force users to change to the first default network when connecting.
 */
export const CustomRainbowKitProvider = ({ chains, children }: { chains: Chain[]; children: ReactNode }) => {
  const chainId = useChainId()

  /**
   * Move the current chain to the front of the chains array
   */
  const chainsOrdered = useMemo(() => {
    if (!chainId) return chains
    let _chains = [...chains]
    const i = _chains.findIndex((chain) => chain.id === chainId)
    if (i !== -1) {
      const chain = _chains[i]
      _chains.splice(i, 1)
      _chains.unshift(chain)
      console.log('re-ordered', _chains)
    }
    return _chains
  }, [chainId, chains])

  return (
    <RainbowKitProvider chains={chainsOrdered} theme={rainbowKitTheme}>
      {children}
    </RainbowKitProvider>
  )
}
