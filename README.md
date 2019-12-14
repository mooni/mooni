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

The integration is easy as adding a button on any website which will open Mooni app.

### With iFrame

To include Mooni, just add an iframe element within your website code and link to the Mooni Send page.

This solution is quick and will be always up-to-date with the latest versions.

You can [check an example](https://mooni-host-iframe.now.sh/) of such integration, with the source code at [host-examples/iframe-host/public/index.html](host-examples/iframe-host/public/index.html).

```html
<iframe
  src="https://mooni.now.sh/send"
  height="660px"
  width="100%"
  style="
    border: 0;
    margin: 0 auto;
    display: block;
    border-radius: 10px;
    max-width: 600px;
    min-width: 300px;
  "
></iframe>
```

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
- Add support for not injected wallet providers (Ledger, Portis...)
- bity cookies not supported on Safari
- add link to transaction while waiting mined and mined
- assert wallet on mainnet
