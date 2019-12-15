import React from 'react';
import './App.css';

import MooniWidget from '@mooni/widget';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        My awesome marketplace
      </header>
      <main className="App-main">
        <button className="open-widget" onClick={() => MooniWidget.open()}>Cash out</button>
      </main>
    </div>
  );
}

export default App;
