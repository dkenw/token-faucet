import { BigNumber, Contract } from 'ethers'
import { Interface } from 'ethers/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useContractWrite, useSigner, useWaitForTransaction } from 'wagmi'
import { TokenData } from './useTokens'

const MAKERDAO_MULTICALL2_ADDRESS = '0x5ba1e12693dc8f9c48aad8770482f4739beed696'

const MULTICALL2_ABI = [
  // struct Call { address target; bytes callData; }
  // struct Result { bool success; bytes returnData; }
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) returns (tuple(bool success, bytes returnData)[] returnData)',
]

const TOKEN_INTERFACE = new Interface(['function mint(uint256 amount)'])

const useCanMint = (tokens: TokenData[] | undefined, mintAmount: number) => {
  const { data: _signer, isFetching: signerFetching } = useSigner()
  const signer = _signer || undefined
  const [canMint, setCanMint] = useState<Record<string, boolean> | undefined>(undefined)

  useEffect(() => {
    if (signerFetching || !signer) return
    if (!tokens) return

    setCanMint(undefined)

    const promises = tokens.map((token) => {
      if (token.symbol === 'WETH') {
        return Promise.resolve({ [token.address]: false })
      }
      const contract = new Contract(token.address, TOKEN_INTERFACE, signer)
      return contract.estimateGas
        .mint(mintAmount)
        .then(() => true)
        .catch(() => false)
        .then((result) => ({ [token.address]: result }))
    })

    ;(async () => {
      const results = (await Promise.all(promises)).reduce((acc, cur) => ({ ...acc, ...cur }), {})
      setCanMint(results) // race condition does happened
    })()
  }, [signer, tokens, mintAmount, signerFetching])

  return signer && tokens ? canMint : undefined
}

export const useMintAll = (tokens: TokenData[] | undefined, mintAmount: number = 10000) => {
  // disable mintAll when there're more than 20 tokens
  const canMint = useCanMint(tokens && tokens.length > 20 ? undefined : tokens, mintAmount)

  const calls = useMemo(() => {
    if (!tokens) return undefined
    if (!canMint) return undefined

    return tokens
      .filter((token) => canMint[token.address])
      .map((token) => {
        const target = token.address
        const rawAmount = BigNumber.from(10).pow(token.decimals).mul(mintAmount)
        const callData = TOKEN_INTERFACE.encodeFunctionData('mint', [rawAmount])
        return { target, callData }
      })
  }, [tokens, mintAmount, canMint])

  const mintAll = useContractWrite({
    addressOrName: MAKERDAO_MULTICALL2_ADDRESS,
    contractInterface: MULTICALL2_ABI,
    functionName: 'tryAggregate',
    args: [false, calls],
  })

  const mintAllTransaction = useWaitForTransaction({
    enabled: mintAll.data != null,
    hash: mintAll.data?.hash,
  })

  return {
    canMintAll: calls && calls.length > 0,
    mintAll,
    mintAllTransaction,
  }
}
