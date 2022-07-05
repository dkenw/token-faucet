import { ConnectButton } from '@rainbow-me/rainbowkit'
import { memo } from 'react'
import './App.css'
import { Column, Row } from './components/layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { useInputField } from './hooks/useInputField'
import { useTokenController } from './hooks/useTokenController'
import { TokenData, useTokens } from './hooks/useTokens'

const DEFAULT_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/dkenw/token-list/master/tokenlist.json'

const TokenRow = memo(function TokenRow({ token }: { token: TokenData }) {
  const mintAmount = 100
  const { canMint, mint, mintTransaction } = useTokenController(token, mintAmount)
  const isMintLoading = mint.isLoading || mintTransaction.isLoading

  return (
    <tr>
      <td>
        <img src={token.logoURI} className="w-8 h-8" alt={token.symbol} />
      </td>
      <td>{token.symbol}</td>
      <td>{token.name}</td>
      <td className="text-sm">{token.address}</td>
      <td className="border-b">
        <Row gap="0.8em" style={{ visibility: canMint ? undefined : 'hidden' }}>
          <button
            className="rounded-md h-7 w-24 bg-neutral-700 hover:bg-neutral-800 disabled:opacity-90 text-white text-sm font-semibold"
            onClick={() => mint.write()}
            disabled={isMintLoading}
          >
            <Row gap="0.5em" justifyCenter>
              {isMintLoading ? <LoadingSpinner /> : <>Mint {mintAmount}</>}
            </Row>
          </button>
          <div className="font-semibold w-1">{mintTransaction.isSuccess ? '✓' : null}</div>
        </Row>
      </td>
    </tr>
  )
})

export default function App() {
  const [tokenListUrl, handleTokenListUrlChange] = useInputField(DEFAULT_TOKEN_LIST_URL, 500)
  const tokens = useTokens(tokenListUrl)

  return (
    <Column stretch gap="24px" style={{ maxWidth: 1000 }} className="mx-auto my-16 px-8">
      <div className="self-end">
        <ConnectButton showBalance={false} accountStatus="address" />
      </div>

      <h1 className="text-3xl font-bold">Faucet</h1>

      <input
        type="url"
        className="border rounded-xl h-12 px-4"
        defaultValue={tokenListUrl}
        onChange={handleTokenListUrlChange}
        placeholder="Enter a token list's URL"
      />

      {tokens && (
        <table className="table-auto">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, i) => (
              <TokenRow key={i} token={token} />
            ))}
          </tbody>
        </table>
      )}
    </Column>
  )
}
