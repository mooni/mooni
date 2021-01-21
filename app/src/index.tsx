import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import { App } from './App';

const incompatibleBrowserElement = document.getElementById('incompatible-browser');
if(incompatibleBrowserElement?.parentNode) {
  incompatibleBrowserElement.parentNode.removeChild(incompatibleBrowserElement)
}
const loaderElement = document.getElementById('loader');
if(loaderElement?.parentNode) {
  loaderElement.parentNode.removeChild(loaderElement)
}

ReactDOM.render(<App/>, document.getElementById('root'));

serviceWorker.unregister(); // https://bit.ly/CRA-PWA
