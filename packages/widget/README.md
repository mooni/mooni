# 🌚 Mooni Widget

![npm (scoped)](https://img.shields.io/npm/v/@mooni/widget)

Mooni widget allows to quickly add Mooni into any web app in minutes.

## 🎁 Quick start
#### Install

`yarn add @mooni/widget`
 
#### Start widget

```js
// Import package
import MooniWidget from '@mooni/widget';

// Open the widget when you want to show Mooni
MooniWidget.open();
```

### 📺 Example apps

An [example app](https://mooni-widget-example.now.sh) including Mooni widget have been published to let you try it.

We also provided some [code examples](../../host-example) that includes Mooni widget.

## 🎛 Reference

- `MooniWidget.open() : Function`  Open the Mooni widget, and returns a method to close it.

## Additional information

### Import on different module systems

- ES6

`import MooniWidget from '@mooni/widget';`

- CommonJS

`const MooniWidget = require('@mooni/widget');`

- UMD

```
<script src="https://unpkg.com/@mooni/widget"></script>
<script> 
  MooniWidget.open()
</script>
```

## 💻 Development

```
# Install dependencies
yarn

# Build package
yarn build

# Publish package
npm publish
```
