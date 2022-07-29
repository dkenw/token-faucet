import { BigNumber } from 'ethers'
import { Interface } from 'ethers/lib/utils'

interface BasicTokenData {
  chainId: number
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  extensions?: Record<string, any>
}

interface MintableTokenData extends BasicTokenData {
  extensions: {
    mintable: {
      default: string
    }
  }
}

export type TokenData = BasicTokenData | MintableTokenData

export const isMintable = (token: TokenData | undefined): token is MintableTokenData => {
  if (!token) return false
  if (!('extensions' in token)) return false

  const amount = token.extensions?.mintable?.default
  return typeof amount === 'string' && /^[0-9]+$/.test(amount)
}

export const getMintAmount = (token: MintableTokenData, overrideMintAmountFloat: number | undefined) => {
  return overrideMintAmountFloat
    ? BigNumber.from(10).pow(token.decimals).mul(overrideMintAmountFloat)
    : BigNumber.from(token.extensions?.mintable?.default as string)
}

export const MINTABLE_TOKEN_ABI = [
  'function mint(uint256 amount)', //
  'function mintTo(address to, uint256 amount)',
]

export const MINTABLE_TOKEN_INTERFACE = new Interface(MINTABLE_TOKEN_ABI)
