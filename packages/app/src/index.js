import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import App from './App';

const incompatibleBrowserElement = document.getElementById('incompatible-browser');
if(incompatibleBrowserElement) {
  incompatibleBrowserElement.parentNode.removeChild(incompatibleBrowserElement)
}

const Root = (
  <App/>
);

ReactDOM.render(Root, document.getElementById('root'));

serviceWorker.unregister(); // https://bit.ly/CRA-PWA
