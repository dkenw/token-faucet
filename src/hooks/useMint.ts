import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useAccount, useContractWrite, useWaitForTransaction } from 'wagmi'
import { getMintAmount, isMintable, MINTABLE_TOKEN_ABI, MINTABLE_TOKEN_INTERFACE, TokenData } from './tokens'

const MAKERDAO_MULTICALL2_ADDRESS = '0x8250eba230eD7fCB90414219faeE89ce85162231'

const MULTICALL2_ABI = [
  /**
   * struct Call { address target; bytes callData; }
   * struct Result { bool success; bytes returnData; }
   */
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',
]

export const useMintAll = (tokens: TokenData[] | undefined, overrideMintAmount?: number | undefined) => {
  const { address } = useAccount()

  const calls = useMemo(() => {
    if (!tokens) return undefined
    if (!address) return undefined

    return tokens.filter(isMintable).map((token) => {
      const rawAmount = getMintAmount(token, overrideMintAmount)
      const callData = MINTABLE_TOKEN_INTERFACE.encodeFunctionData('mintTo', [address, rawAmount])
      return { target: token.address, callData: callData }
    })
  }, [tokens, overrideMintAmount, address])

  const mintAll = useContractWrite({
    addressOrName: MAKERDAO_MULTICALL2_ADDRESS,
    contractInterface: MULTICALL2_ABI,
    functionName: 'tryAggregate',
    args: [false, calls],
  })

  const transaction = useWaitForTransaction({
    enabled: mintAll.data != null,
    hash: mintAll.data?.hash,
  })

  console.log(calls?.length)

  return {
    enabled: Boolean(calls && calls.length > 0),
    mintAll,
    transaction,
  }
}

export const useMint = (token: TokenData | undefined, overrideMintAmount?: number | undefined) => {
  const enabled = isMintable(token)
  const rawAmount = enabled ? getMintAmount(token, overrideMintAmount) : BigNumber.from('0')

  const mint = useContractWrite({
    addressOrName: token?.address ?? '',
    contractInterface: MINTABLE_TOKEN_ABI,
    functionName: 'mint',
    args: token ? [rawAmount] : undefined,
  })

  const transaction = useWaitForTransaction({
    enabled: mint.data != null,
    hash: mint.data?.hash,
  })

  const mintAmount =
    token && enabled //
      ? Number((Number(rawAmount) / 10 ** token.decimals).toPrecision(4)).toLocaleString(undefined, {
          maximumSignificantDigits: 4,
        })
      : undefined

  return {
    enabled,
    mint,
    mintAmount,
    transaction,
  }
}
