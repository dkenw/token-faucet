import { BigNumber, Contract } from 'ethers'
import { useEffect, useState } from 'react'
import { useAccount, useContract, useContractWrite, useSigner, useWaitForTransaction } from 'wagmi'
import { TokenData } from './useTokens'

const ABI = [
  // Read-Only functions
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',

  // Authenticated functions
  'function transfer(address to, uint amount) returns (bool)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint amount)',

  // MockERC20 functions
  'function mint(uint256 amount)',
]

const useCanMint = (token: TokenData | undefined, mintAmount: number) => {
  const [canMint, setCanMint] = useState(false)

  const { data: signer } = useSigner()
  const tokenContract = useContract<Contract>({
    addressOrName: token?.address ?? '',
    contractInterface: ABI,
    signerOrProvider: signer,
  })

  useEffect(() => {
    if (tokenContract.address === '' || tokenContract.signer == null) return
    tokenContract.estimateGas
      .mint(mintAmount)
      .then(() => setCanMint(true))
      .catch(() => setCanMint(false))
  }, [tokenContract, mintAmount])

  return canMint
}

export const useTokenController = (token: TokenData | undefined, mintAmount: number = 1000) => {
  const canMint = useCanMint(token, mintAmount)

  const mint = useContractWrite({
    addressOrName: token?.address ?? '',
    contractInterface: ABI,
    functionName: 'mint',
    args: token ? [BigNumber.from(10).pow(token.decimals).mul(mintAmount)] : undefined,
  })

  const mintTransaction = useWaitForTransaction({
    enabled: mint.data != null,
    hash: mint.data?.hash,
  })

  const { address } = useAccount()

  return {
    canMint: canMint && token?.symbol !== 'WETH' && address != null,
    mint,
    mintTransaction,
  }
}
