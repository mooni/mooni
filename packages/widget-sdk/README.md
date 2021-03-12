

# 🌚 Mooni Widget

[![npm (scoped)](https://img.shields.io/npm/v/@mooni/widget)](https://www.npmjs.com/package/@mooni/widget)

[Mooni](https://mooni.tech) is the off-ramping solution for the DeFi ecosystem, which can enable users of your dApp to cash out the cryptocurrencies they earn directly into their bank account.

Our widget SDK is a super simple solution to integrate Mooni into your already existing application.  
The widget can either appear as a modal on top of an app, or included inside an HTML element.    
If the hosting app already has a connected user with web3, this wallet can be forwarded to the widget.

### 📺 Example integration
Check our [live integration example](https://integration-example.mooni.tech) ([code](https://github.com/mooni/mooni/tree/master/packages/example-host))

## 🎁 Quick start
#### Install

`yarn add @mooni/widget`
#### Start widget

```ts 
// Import package 
import MooniWidget from '@mooni/widget';

// Instanciate the widget 
const mooni = new MooniWidget(); 

// Open the widget as a modal when you want it 
mooni.open();
 ```   
That's it 🥂 !

## 🎛 API Reference

### MooniWidget

```ts  
constructor(opts: MooniWidgetOptions)  
```  

#### Methods

##### Open widget
```ts  
open(): void  
```  
Opens Mooni as a widget.

##### Set Ethereum provider
```ts  
setEthereum(ethereum?: EthereumProvider): void  
```  
Set an Ethereum provider. Call this method when your users log in with their wallet. They will become automatically logged in Mooni.

### MooniWidgetOptions

```ts  
containerElement?: HTMLElement  
```  
Include Mooni inside of an HTML element on your website if you don't want to use modal mode.

```ts  
ethereum?: EthereumProvider  
```  
A standard JSON-RPC provider. This is useful if the hosting app already authenticated the web3 wallet of the user, so he doesn't have to login again on Mooni.

```ts  
token?: string  
```  

Automatically select a token to sell in Mooni. Must be an ERC20 **contract address**. Default is *ETH*.

```ts  
referralId?: string  
```  

Sets a referral account. All orders passed with this referral ID through the widget will share profit. You can find your referral ID on your [*Account*](https://app.mooni.tech/account) page.


## Additional information

### Import on different module systems

- ES6

`import MooniWidget from '@mooni/widget';`

- CommonJS

`const MooniWidget = require('@mooni/widget');`

- UMD

``` <script src="https://unpkg.com/@mooni/widget"></script> <script>     
  /* available as MooniWidget */  
</script> ```   
## 💻 Development  
  
``` # Install dependencies yarn    
 # Build package yarn build    
 # Publish package npm publish ```