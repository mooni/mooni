# 🌚 Mooni

Easily transfer funds from your crypto wallet to your bank account.

[🖼 Landing page](https://mooni.tech)

[🚀 Web Application](https://app.mooni.tech)

[🔮 Frontend integration](#-frontend-integration)

[📎 Burner Wallet Plugin](#-burner-wallet-plugin)

> This is experimental software under active development.

## 📃 Presentation

Mooni is a simple solution for end-users, marketplaces or DAOs to cash out cryptos in fiat directly to a bank account.

### Features

* **Web wallets** Login with any web3-compatible wallet _\(Metamask, Portis, WalletConnect, Ledger, mobile wallets\)_
* **Bank transfer** Receive funds in your bank account in EUR/CHF \(thanks to [Bity](https://bity.com)\)
* **Private storage** Store your bank account information securely encrypted in IPFS \(thanks to [3Box](https://3box.io)\)
* **No account** Withdraw up to 5000€ per year without KYC
* **Decentralized** All in browser

[🚀 Use Mooni now](https://app.mooni.tech)


### Use cases

* **Crypto owner** I am a crypto user and I want to withdraw some crypto to my bank account
* **dApp developer** I am a dApp developer and I want to allow my users to withdraw funds to their bank account \(games, decentralized marketplaces, via a widget\)
* **DAOs** I am member of a DAO and I want to withdraw funds to my bank account

## 🔮 Frontend integration

You can easily integrate Mooni into your web application and quickly enable your users to cash out their crypto.

This is useful for marketplace builders which want to increase conversion rate by allowing their users to withdraw the profit they make on the app.


An [example app](https://mooni-widget-example.now.sh) including Mooni widget is available to let you try it out.

### 🎁 Quick start

#### Install

`yarn add @mooni/widget`

#### Start widget

```javascript
// Import package
import MooniWidget from '@mooni/widget';

// Instanciate the widget
const mooni = new MooniWidget();

// Open the widget when you want to show Mooni
mooni.open();
```
Check [the package](./packages/widget-sdk) for full API documentation.

## 📎 Burner Wallet Plugin

A plugin for [Burner Wallet](https://github.com/burner-wallet/burner-wallet-2/) have been done to easily add the possibilty to cash out.

We have our own [Mooni Burner Wallet](https://burner.mooni.tech) deployed if you want to try it.

Please refer to the [plugin documentation](packages/burner-plugin) for integration instructions.


## 💻 Development

This repo is a monorepo including different apps and libraries for running mooni which are located under folders in `packages/*`.

### App

The app is in the `packages/app` folder.

#### Start tooling

```bash
# Install dependencies
yarn

# Start dev server
yarn start

# Build production bundle
yarn build
```

### Burner plugin

#### Start tooling

```bash
# Install dependencies
yarn

# Start dev server
yarn start:burner

```
