# Mooni Widget

Mooni widget allows to quickly add Mooni into any web app in minutes.

## Quick start

- Install package

`yarn add @mooni/widget`

or

`npm install --save @mooni/widget`
 
- import and open widget

```js
import MooniWidget from '@mooni/widget';

MooniWidget.open();
```

### Example apps

An [example app](https://mooni-host-iframe.now.sh/) including Mooni widget have been published to let you try it.

We also provided some [code examples](host-example) that includes Mooni widget.

## Reference

`MooniWidget.open()`

Open the Mooni widget, and returns a method to close it.

## Additional information

### Import on different module systems

- ES6

`import MooniWidget from '@mooni/widget';`

- CommonJS

`const MooniWidget = require('@mooni/widget');`

- UMD

`<script src="https://unpkg.com/@mooni/widget"></script>`;

## Development

```
# Install dependencies
yarn

# Build package
yarn build

# Publish package
npm publish
```
