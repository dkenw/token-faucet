import { BigNumber, constants } from 'ethers'
import { useMemo } from 'react'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { getMintAmount, isMintable, MINTABLE_TOKEN_ABI, MINTABLE_TOKEN_INTERFACE, TokenData } from './tokens'
import { useChainId } from './useChainId'

const MAKERDAO_MULTICALL2_ADDRESS = '0x8250eba230eD7fCB90414219faeE89ce85162231'

const MULTICALL2_ABI = [
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',
]

const useContractWriteAndGetTransaction = (config: Parameters<typeof useContractWrite>[0]) => {
  const controller = useContractWrite(config)
  const tx = controller.data
  const txReceipt = useWaitForTransaction({ enabled: tx != null, hash: tx?.hash })
  return { controller, tx, txReceipt }
}

export const useMintAll = (
  tokens: TokenData[] | undefined,
  overrideMintAmountFloat?: number | undefined,
  overrideChainId?: number | undefined
) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const chainId = overrideChainId ?? currentChainId

  console.log('chainId', chainId)

  const mintableTokens = useMemo(
    () => tokens?.filter((token) => token.chainId === chainId).filter(isMintable),
    [tokens, chainId]
  )

  const calls = useMemo(() => {
    return mintableTokens?.map((token) => {
      const rawAmount = getMintAmount(token, overrideMintAmountFloat)
      const callData = MINTABLE_TOKEN_INTERFACE.encodeFunctionData('mintTo', [
        address || constants.AddressZero,
        rawAmount,
      ])
      return {
        target: token.address,
        callData: callData,
      }
    })
  }, [mintableTokens, overrideMintAmountFloat, address])

  const enabled = Boolean(address) && calls != null && calls.length > 0

  const { controller, txReceipt } = useContractWriteAndGetTransaction({
    chainId,
    addressOrName: enabled ? MAKERDAO_MULTICALL2_ADDRESS : '',
    contractInterface: MULTICALL2_ABI,
    functionName: 'tryAggregate',
    args: [false, calls],
  })

  return {
    enabled,
    controller,
    txReceipt,
    mintableCount: mintableTokens?.length ?? 0,
  }
}

export const useMint = (token: TokenData | undefined, overrideMintAmountFloat?: number | undefined) => {
  const enabled = isMintable(token)
  const rawAmount = enabled ? getMintAmount(token, overrideMintAmountFloat) : BigNumber.from('0')

  const { controller, txReceipt } = useContractWriteAndGetTransaction({
    chainId: token?.chainId,
    addressOrName: token?.address ?? '',
    contractInterface: MINTABLE_TOKEN_ABI,
    functionName: 'mint',
    args: [rawAmount],
  })

  const mintAmountReadable =
    token && enabled
      ? (+(+rawAmount / 10 ** token.decimals).toPrecision(4)).toLocaleString(undefined, { maximumSignificantDigits: 4 })
      : undefined

  return {
    enabled,
    controller,
    txReceipt,
    mintAmountReadable,
  }
}
