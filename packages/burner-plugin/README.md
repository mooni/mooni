# Burner Wallet Mooni Plugin

[![npm (scoped)](https://img.shields.io/npm/v/@mooni/burner-plugin)](https://www.npmjs.com/package/@mooni/burner-plugin)

Allows transfering funds from you Burner Wallet to your bank account. 

This plugin is using [Mooni](https://mooni.tech) app.

## Usage

Install package:

```
yarn add @mooni/burner-plugin
```

Add plugin to Burner Wallet

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { eth, dai, usdc } from '@burner-wallet/assets';
import BurnerCore from '@burner-wallet/core';
import { LocalSigner } from '@burner-wallet/core/signers';
import { InfuraGateway } from '@burner-wallet/core/gateways';
import ModernUI from '@burner-wallet/modern-ui';

import MooniPlugin from '@mooni/burner-plugin';

const core = new BurnerCore({
  signers: [new LocalSigner()],
  gateways: [
    new InfuraGateway(process.env.REACT_APP_INFURA_KEY),
  ],
  assets: [eth, dai, usdc],
});

const BurnerWallet = () =>
  <ModernUI
    title="Mooni Burner Wallet"
    core={core}
    plugins={[new MooniPlugin()]}
  />


ReactDOM.render(<BurnerWallet />, document.getElementById('root'));
```
