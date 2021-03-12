import React, { useCallback } from 'react';

import MooniWidget from '@mooni/widget';

const mooni = new MooniWidget({
  token: '0x30cF203b48edaA42c3B4918E955fED26Cd012A3F',
  referralId: 'ckk53rb6h0001vpb1lqp4ovg',
  ethereum: window['ethereum'],
});

function Home() {

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

export default Home;
