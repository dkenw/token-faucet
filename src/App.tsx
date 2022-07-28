import { ConnectButton } from '@rainbow-me/rainbowkit'
import { memo } from 'react'
import { useAccount } from 'wagmi'
import './App.css'
import { Column, Row } from './components/layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { TokenData } from './hooks/tokens'
import { useChainId } from './hooks/useChainId'
import { useInputField } from './hooks/useInputField'
import { useMint, useMintAll } from './hooks/useMint'

import { useTokens } from './hooks/useTokens'

const DEFAULT_TOKEN_LIST_URL = 'https://raw.githubusercontent.com/dkenw/token-list/master/tokenlist.json'

// const MINT_AMOUNT = 1000

const TokenRow = memo(function TokenRow({ token }: { token: TokenData }) {
  const { mint, mintAmount, enabled: mintEnabled, transaction: mintTransaction } = useMint(token)
  const isMintLoading = mint.isLoading || mintTransaction.isLoading

  const { address } = useAccount()

  return (
    <tr>
      <td>
        <img src={token.logoURI} className="w-8 h-8" alt={token.symbol} />
      </td>
      <td>{token.symbol}</td>
      <td>{token.name}</td>
      <td className="text-sm">{token.address}</td>
      <td>
        <Row
          gap="0.8em"
          style={{
            visibility: mintEnabled ? undefined : 'hidden',
            pointerEvents: address ? undefined : 'none',
            opacity: address ? undefined : 0.25,
          }}
        >
          <button
            className="rounded-md h-7 min-w-max w-24 bg-neutral-700 px-2 hover:bg-neutral-800 disabled:opacity-90 text-white text-xs font-semibold"
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
  const chainId = useChainId()

  const [tokenListUrl, handleTokenListUrlChange] = useInputField(DEFAULT_TOKEN_LIST_URL, 500)
  const { tokensByChainId, data: listData } = useTokens(tokenListUrl)
  const tokens = chainId ? tokensByChainId?.[chainId] : undefined

  const mintAll = useMintAll(tokens)
  const isMintAllLoading = mintAll.mintAll.isLoading || mintAll.transaction.isLoading

  const { address } = useAccount()

  console.log(mintAll.enabled, mintAll)

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

      {listData && (
        <Row gap="1em">
          <img
            src={listData?.logoURI ?? ''}
            className="w-14 h-14"
            alt={listData.name}
            style={{ border: '1px solid #eee', borderRadius: 6 }}
          />
          <Column gap="">
            <h2 className="font-bold">{listData.name}</h2>
            <div className="text-sm">{tokens?.length ?? 0} tokens in the current network</div>
          </Column>
        </Row>
      )}

      {/* <h3 className="font-bold">Rinkeby</h3> */}

      {/* <div>
        Total {allTokens?.length} tokens in the list. {tokens?.length} tokens in this network.
      </div> */}

      {tokens && (
        <table className="table-auto">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Symbol</th>
              <th>Name</th>
              <th>Address</th>
              <th>
                <Row
                  gap="0.8em"
                  style={{
                    visibility: mintAll.enabled ? undefined : undefined, // 'hidden',
                    pointerEvents: address ? undefined : 'none',
                    opacity: address ? undefined : 0.25,
                  }}
                >
                  <button
                    className="rounded-md h-7 min-w-max w-24 px-2 bg-neutral-700 hover:bg-neutral-800 disabled:opacity-90 text-white text-sm font-semibold"
                    onClick={() => mintAll.mintAll.write()}
                    disabled={isMintAllLoading}
                  >
                    <Row gap="0.5em" justifyCenter>
                      {isMintAllLoading ? <LoadingSpinner /> : <>Mint all</>}
                    </Row>
                  </button>
                  <div className="font-semibold w-1">{mintAll.transaction.isSuccess ? '✓' : null}</div>
                </Row>
              </th>
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
