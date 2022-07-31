import { Tab } from '@headlessui/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import classNames from 'classnames'
import { memo, useMemo } from 'react'
import { allChains, Chain, useAccount } from 'wagmi'
import './App.css'
import { Column, Row } from './components/layout'
import { LoadingSpinner } from './components/LoadingSpinner'
import { TokenData } from './hooks/tokens'
import { useChainId } from './hooks/useChainId'
import { useMint, useMintAll } from './hooks/useMint'
import { useTokenListUrlFromQueryString } from './hooks/useTokenListUrlFromQueryString'
import { useTokens } from './hooks/useTokens'

const chainsById: Record<number, Chain> = allChains.reduce((acc, chain) => ({ ...acc, [chain.id]: chain }), {})

const OVERRIDE_MINT_AMOUNT = undefined

const uriToHttp = (uri: string): string => {
  const protocol = uri.split(':')[0].toLowerCase()
  switch (protocol) {
    case 'ipfs':
      const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2]
      return `https://cloudflare-ipfs.com/ipfs/${hash}/`
    case 'ipns':
      const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2]
      return `https://cloudflare-ipfs.com/ipns/${name}/`
    default:
      return uri
  }
}

const TokenRow = memo(function TokenRow({ token }: { token: TokenData }) {
  const { isConnected } = useAccount()

  const mint = useMint(token, OVERRIDE_MINT_AMOUNT)
  const isMintLoading = mint.controller.isLoading || mint.txReceipt.isLoading

  return (
    <tr>
      <td>{token.logoURI && <img src={uriToHttp(token.logoURI)} className="w-8 h-8" alt={token.symbol} />}</td>
      <td>{token.symbol}</td>
      <td>{token.name}</td>
      {/* <td>{chainsById[token.chainId]?.name ?? token.chainId}</td> */}
      <td className="text-xs">
        <Row>
          {token.address}&nbsp;
          <CopyIcon size="1em" text={token.address} />
        </Row>
      </td>
      <td>
        <Row gap="0.8em" justifyEnd>
          {mint.txReceipt.isSuccess ? <div className="font-semibold w-1">✓</div> : null}
          <span className={classNames(isConnected ? undefined : 'cursor-not-allowed')}>
            <button
              className="rounded-md h-7 min-w-max w-24 bg-neutral-700 px-2 hover:bg-neutral-800 disabled:opacity-90 text-white text-xs font-semibold"
              onClick={() => mint.controller.write()}
              disabled={isMintLoading}
              style={{
                visibility: mint.mintable ? undefined : 'hidden',
                pointerEvents: isConnected ? undefined : 'none',
                opacity: isConnected ? undefined : 0.25,
              }}
            >
              <Row gap="0.5em" justifyCenter>
                {isMintLoading ? <LoadingSpinner /> : <>Mint {mint.mintAmountReadable}</>}
              </Row>
            </button>
          </span>
        </Row>
      </td>
    </tr>
  )
})

const TokenList = memo(function TokenList({
  allTokens,
  chainId,
}: {
  allTokens: TokenData[] | undefined
  chainId: number | undefined
}) {
  const { isConnected } = useAccount()

  const tokens = useMemo(() => allTokens?.filter((token) => token.chainId === chainId), [allTokens, chainId])
  const mintAll = useMintAll(tokens, OVERRIDE_MINT_AMOUNT, chainId)
  const isMintAllLoading = mintAll.controller.isLoading || mintAll.txReceipt.isLoading

  if (!tokens) return null

  return (
    <table className="table-auto w-full text-sm">
      <thead>
        <tr>
          <th>Logo</th>
          <th>Symbol</th>
          <th>Name</th>
          {/* <th>Network</th> */}
          <th>Address</th>
          <th>
            {mintAll.mintableCount === 0 ? (
              <button
                className="rounded-md h-7 min-w-max w-24 px-2 bg-neutral-700 text-white text-xs font-semibold opacity-30 cursor-not-allowed"
                disabled
              >
                <>No mintable tokens</>
              </button>
            ) : (
              <Row gap="0.8em" justifyEnd>
                {mintAll.txReceipt.isSuccess ? <div className="font-semibold w-1">✓</div> : null}
                <span className={classNames(isConnected ? undefined : 'cursor-not-allowed')}>
                  <button
                    className="rounded-md h-7 min-w-max w-24 px-2 bg-neutral-700 hover:bg-neutral-800 disabled:opacity-90 text-white text-xs font-semibold"
                    onClick={() => mintAll.controller.write()}
                    disabled={isMintAllLoading}
                    style={isConnected ? undefined : { pointerEvents: 'none', opacity: 0.25 }}
                  >
                    <Row gap="0.5em" justifyCenter>
                      {isMintAllLoading ? <LoadingSpinner /> : <>Mint all</>}
                    </Row>
                  </button>
                </span>
              </Row>
            )}
          </th>
        </tr>
      </thead>
      <tbody>
        {tokens.map((token, i) => (
          <TokenRow key={i} token={token} />
        ))}
      </tbody>
    </table>
  )
})

export default function App() {
  const tokenListUrl = useTokenListUrlFromQueryString() ?? ''
  const { tokens: allTokens, tokensByChainId, data: listData } = useTokens(tokenListUrl)

  const currentChainId = useChainId()
  const chainIds = useMemo(
    () =>
      tokensByChainId
        ? Object.keys(tokensByChainId)
            .map((x) => parseInt(x))
            .sort((a, b) => (a === currentChainId ? -1 : a < b ? -1 : 1))
        : undefined,
    [tokensByChainId, currentChainId]
  )

  return (
    <Column stretch gap="32px" style={{ maxWidth: 850 }} className="mx-auto my-8 px-4">
      <Column stretch gap="8px">
        <div className="self-end">
          <ConnectButton showBalance={false} accountStatus="address" />
        </div>
        <h1 className="text-3xl font-bold">Token Faucet</h1>
      </Column>

      <Column stretch gap="12px">
        {/* <Column stretch gap="4px" as="label">
          <div className="text-sm font-medium">Token list URL</div>
          <input
            type="url"
            className="border rounded-xl h-12 px-4"
            defaultValue={tokenListUrl}
            onChange={handleTokenListUrlChange}
            placeholder="Enter a token list's URL"
          />
        </Column> */}
        {listData && (
          <Row gap="1em">
            <img
              src={uriToHttp(listData?.logoURI ?? '')}
              className="w-16 h-16"
              alt={listData.name}
              style={{ border: '1px solid #eee', borderRadius: 6 }}
            />
            <Column gap="2px">
              <h2 className="font-bold">{listData.name}</h2>
              <div className="text-sm">{allTokens?.length ?? 0} tokens</div>
              <Row className="text-sm break-all">
                {tokenListUrl}&nbsp;
                <CopyIcon size="1em" text={tokenListUrl} />
              </Row>
            </Column>
          </Row>
        )}
      </Column>

      {listData && (
        <Row gap="0.5em" className="rounded-xl bg-neutral-50 border-neutral-200 border px-4 py-4">
          <span className="text-xl">💡</span>
          <div>
            If you need native ETH, please use{' '}
            <a className="underline" href="https://faucet.paradigm.xyz/" target="_blank" rel="noreferrer">
              Paradigm Faucet
            </a>{' '}
            or{' '}
            <a className="underline" href="https://faucets.chain.link/" target="_blank" rel="noreferrer">
              Chainlink Faucet
            </a>
            .
          </div>
        </Row>
      )}

      <Column stretch gap="12px">
        <Tab.Group>
          <Tab.List className="flex gap-x-8 gap-y-2 font-bold text-xl flex-wrap">
            {chainIds?.map((chainId) => (
              <Tab
                key={chainId}
                className={({ selected }) =>
                  classNames('focus:outline-none', selected ? null : 'opacity-20 hover:opacity-30')
                }
              >
                {chainsById[chainId]?.name ?? chainId}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {chainIds?.map((chainId) => (
              <Tab.Panel key={chainId} className="overflow-x-auto">
                <TokenList allTokens={tokensByChainId?.[chainId]} chainId={chainId} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </Column>
    </Column>
  )
}

const CopyIcon = ({ text, size }: { text: string; size: string }) => (
  <span
    role="button"
    className="cursor hover:text-neutral-700 active:text-neutral-400"
    style={{ lineHeight: 0 }}
    onClick={() => navigator.clipboard.writeText(text)}
  >
    <svg
      className="inline"
      style={{ verticalAlign: 'text-bottom', width: size, height: size }}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    </svg>
  </span>
)
