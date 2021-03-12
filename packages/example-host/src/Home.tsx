import React, { useCallback, useMemo, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core'
import MooniWidget from '@mooni/widget';
import { InjectedConnector } from '@web3-react/injected-connector';

const injected = new InjectedConnector({ supportedChainIds: [1] })

function Home() {
  const { activate, deactivate, account, library } = useWeb3React();

  const mooni = useMemo(() => new MooniWidget({
    token: '0x30cF203b48edaA42c3B4918E955fED26Cd012A3F',
    referralId: 'ckk53rb6h0001vpb1lqp4ovg',
  }), []);

  const openMooni = useCallback(() => {
    mooni.open();
  }, [mooni]);

  useEffect(() => {
    mooni.setEthereum(library?.provider);
  }, [mooni, library]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>DeFi Degen Kingdom</h1>
        {account?
          <div>
            <span className="address">{account}</span>
            <button onClick={() => deactivate()}>Disconnect</button>
          </div>
        :
          <button onClick={() => activate(injected)}>Connect wallet</button>
        }
      </header>
      <main className="App-main">
        <p>You've earned 0.1234 ETH on farming.</p>
        <p>You can cash out these earnings directly to your bank account:</p>
        <button className="open-widget" onClick={openMooni}>Cash out</button>
      </main>
    </div>
  );
}

export default Home;
