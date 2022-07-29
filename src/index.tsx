import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { providers } from 'ethers'
import React from 'react'
import ReactDOM from 'react-dom'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import App from './App'
import { CustomRainbowKitProvider } from './components/CustomRainbowKitProvider'
import './index.css'
import reportWebVitals from './reportWebVitals'

/**
 * Prepare fallback public providers if no metamask is found
 */
const { chains: defaultChains, provider } = configureChains(
  [
    chain.rinkeby,
    chain.ropsten,
    chain.goerli,
    chain.kovan,
    chain.optimismKovan,
    chain.polygonMumbai,
    chain.arbitrumRinkeby,
  ],
  [publicProvider()]
)

/**
 * Prepare connectors via rainbowkit
 */
const { connectors } = getDefaultWallets({
  appName: 'Token Faucet',
  chains: defaultChains,
})

/**
 * Prepare web3Provider if there's metamask
 */
const web3Provider =
  window.ethereum && window.ethereum?.isMetaMask
    ? Object.assign(new providers.Web3Provider(window.ethereum as any), { chains: defaultChains })
    : undefined

/**
 * Create wagmi client. Use web3Provider if requesting a provider of a chain that the user's metamask is also using.
 * Otherwise, use fallback public providers.
 */
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider: ({ chainId }) => {
    if (web3Provider && web3Provider.network?.chainId === chainId) return web3Provider
    return provider({ chainId })
  },
})

/**
 * Prepare a render app function.
 * Note that we use a custom rainbowkit provider that doesn't force user to switch network when connecting.
 */
const render = () => {
  ReactDOM.render(
    <React.StrictMode>
      <WagmiConfig client={wagmiClient}>
        <CustomRainbowKitProvider chains={defaultChains}>
          <App />
        </CustomRainbowKitProvider>
      </WagmiConfig>
    </React.StrictMode>,
    document.getElementById('root')
  )
}

/**
 * If there's metamask, we wait for web3Provider to load network info from metamask before rendering.
 * This is because wagmi doesn't expect a provider without `.network` at anytime.
 */
if (web3Provider && web3Provider.network == null) {
  Promise.race([
    web3Provider.getNetwork(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Wait too long for web3Provider to load network'))
      }, 2000)
    }),
  ])
    .catch((error) => console.error(error))
    .then(() => render())
} else {
  render()
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
