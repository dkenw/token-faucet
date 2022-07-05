import { getDefaultWallets, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import App from './App'
import './index.css'
import reportWebVitals from './reportWebVitals'

const { chains, provider } = configureChains([chain.rinkeby, chain.mainnet], [publicProvider()])

const { connectors } = getDefaultWallets({
  appName: 'Token Faucet',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const rainbowKitTheme = lightTheme({
  accentColor: '#333',
  borderRadius: 'medium',
  fontStack: 'system',
})
rainbowKitTheme.shadows.connectButton = '0px 2px 6px rgba(0, 0, 0, 0.1)'

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={rainbowKitTheme}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
