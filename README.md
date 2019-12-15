# Mooni

Easily transfer funds from your crypto wallet to your bank account.

[Landing page](https://mooni.launchaco.com)

[Web Application](https://mooni.now.sh)

> This is experimental software under active development.

## Presentation

Mooni provides a simple solution for end-users, marketplaces or DAOs to cash out their crypto in fiat directly to a bank account.

### Features
- Login with any web3-compatible wallet *(Metamask, Coinbase Wallet, Trust Wallet, ...)*
- Store your account information encrypted in IPFS (thanks to [3Box](https://3box.io))
- Send to your bank account in EUR/CHF (thanks to [Bity](https://bity.com))


*This project is in early stage and shall be used with care.*

### Use cases
- I am a end user and I want to withdraw some crypto on my bank account
- I am a dApp developer and I want to allow my users to withdraw funds to their bank account (such as decentralized marketplaces, via a widget or iFrame)
- I have a DAO (Aragon) and I want to be able to pay a bill in fiat with Vault funds

## Add to your app

You can easily integrate Mooni into your web application and quickly enable your users to cash out their crypto.

This is useful for marketplace builders which want to increase conversion rate by allowing their users to withdraw the profit they make on the app.


### Quick start

- Install package

`yarn add @mooni/widget`
 
- import and open widget

```js
import MooniWidget from '@mooni/widget';

MooniWidget.open();
```

You can check [the package](packages/widget) to get full documentation.

We provided some [example applications](host-example) that includes Mooni widget.

## Development

### Start tooling

```
# Install dependencies
yarn

# Start dev server
yarn start

# Build production bundle
yarn build
```

## TODO

- Integrate in any React app as component (with injected provider)
- Integrate in any app as React app (with injected provider)
- Reset order after exceed time guaranteed time
- Update status from bity after payment on an /order/{orderId} page
- Add liquidity provider to accept any ERC20 token
- Add support for not injected wallet providers (WalletConnect, Ledger, Portis...)
- bity cookies not supported on Safari
- add link to transaction while waiting mined and mined
- assert wallet on mainnet
