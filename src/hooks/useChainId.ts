import { useNetwork } from 'wagmi'

export const useChainId = () => {
  const { chain } = useNetwork()

  if (chain) return chain?.id

  const chainId = (window?.ethereum as any)?.chainId as string | undefined

  if (chainId != null && `${chainId}`.startsWith('0x')) {
    return parseInt(`${chainId}`.slice(2)) || undefined
  }
  return undefined
}
