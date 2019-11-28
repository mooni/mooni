# crypto-off-ramp

> This is experimental software under active development.

## Presentation

This web app allows to easily transfer money from your crypto wallet to your bank account. 

This is just a UI that connect different providers, we do not have any backend or smart contract. 

### Features
- Login with any web3-compatible wallet *(Metamask, Coinbase Wallet, Trust Wallet, ...)*
- Store your account information encrypted in IPFS (thanks to [3Box](https://3box.io))
- Pay with ETH or any ERC20 token (thanks to [DEX.AG](https://dex.ag))
- Send to your bank account in EUR/CHF (thanks to [Bity](https://bity.com))


*This project is in early stage and not all features are developed yet.*

### Use cases
- I am a end user and I want to withdraw some crypto on my bank account
- I am a dApp developer and I want to allow my users to withdraw funds to their bank account (such as decentralized marketplaces, via a widget or iFrame)
- I have a DAO (Aragon) and I want to be able to pay a bill in fiat with Vault funds

## Available Scripts

In the project directory, you can run:
### Install

```
# Install dependencies
yarn
```
### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

## TODO

- reset order after exceed time guaranteed time
- Update status from bity
- dex to accept any input token
- support not-injected eth providers
- bity cookies doesnt work on coinbase wallet and trust wallet
