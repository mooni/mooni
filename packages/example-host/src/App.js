import React, { useCallback } from 'react';
import './App.css';

import MooniWidget from '@mooni/widget';

const mooni = new MooniWidget();

function App() {

  const openMooni = useCallback(() => {
    mooni.open();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        My awesome marketplace
      </header>
      <main className="App-main">
        <button className="open-widget" onClick={openMooni}>Cash out</button>
      </main>
    </div>
  );
}

export default App;
