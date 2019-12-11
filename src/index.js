import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';
import WidgetDemo from './WidgetDemo';
//import * as serviceWorker from './serviceWorker';

// process.env.REACT_APP_WIDGET_DEMO = 'true';

if(process.env.REACT_APP_WIDGET_DEMO) {
  ReactDOM.render(<WidgetDemo />, document.getElementById('root'));
} else {
  ReactDOM.render(<Root />, document.getElementById('root'));
}

//serviceWorker.unregister();
