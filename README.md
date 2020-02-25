# 🌚 Mooni

Easily transfer funds from your crypto wallet to your bank account.

[🖼 Landing page](https://mooni.tech)

[🚀 Web Application](https://app.mooni.tech)

[📚 Developer documentation](https://doc.mooni.tech)

[🔮 Frontend integration](#-Frontend-integration)

> This is experimental software under active development.

## 📃 Presentation

Mooni is a simple solution for end-users, marketplaces or DAOs to cash out cryptos in fiat directly to a bank account.

### Features
- **Web wallets** Login with any web3-compatible wallet *(Metamask, Portis, WalletConnect, Ledger, mobile wallets)*
- **Bank transfer** Receive funds in your bank account in EUR/CHF (thanks to [Bity](https://bity.com))
- **Private storage** Store your bank account information securely encrypted in IPFS (thanks to [3Box](https://3box.io))
- **No account** Withdraw up to 5000€ per year without KYC
- **Decentralized** All in browser

[🚀 Use Mooni now](https://app.mooni.tech)

*This project is in early stage and shall be used with care.*

### Use cases
- **Crypto owner** I am an end user and I want to withdraw some crypto to my bank account
- **dApp developer** I am a dApp developer and I want to allow my users to withdraw funds to their bank account (games, decentralized marketplaces, via a widget)
- **DAOs** I have a DAO (Aragon) and I want to be able to pay a bill in fiat with Vault funds

## 🔮 Frontend integration

You can easily integrate Mooni into your web application and quickly enable your users to cash out their crypto.

This is useful for marketplace builders which want to increase conversion rate by allowing their users to withdraw the profit they make on the app.


### 🎁 Quick start

#### Install

`yarn add @mooni/widget`

#### Start widget

```js
// Import package
import MooniWidget from '@mooni/widget';

// Open the widget when you want to show Mooni
MooniWidget.open();
```

An [example app](https://mooni-widget-example.now.sh) including Mooni widget have been published to let you try it.

We also provided some [code examples](host-example) that includes Mooni widget.

You can check [the package](packages/widget) to get full documentation.

## 💻 Development

### Start tooling

```
# Install dependencies
yarn

# Start dev server
yarn start

# Build production bundle
yarn build
```

## 💭 TODO

Here's a list of what to come next

- Add login without wallet, display deposit address
- Fix Steps UX on mobile
- Reset order after exceed guaranteed time
- Update status from bity after payment on an /order/{orderId} page
- Add liquidity provider to accept any ERC20 token
- Support more wallet providers (Ledger, Fortmatic)
- bity cookies not supported on Safari
- add link to transaction while waiting mined and mined
- assert wallet on mainnet
- Try to pass web3 provider through iframe
