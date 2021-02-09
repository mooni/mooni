import React from 'react';

import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { useSelector } from 'react-redux';

import './App.css';

import HomePage from './pages/HomePage';
import ExchangePage from './pages/ExchangePage';
import StatusPage from './pages/StatusPage';
import AccountPage from './pages/AccountPage';
import StatsPage from './pages/StatsPage';

import { usePageViews } from './lib/analytics';
import { getWalletStatus, isWalletLoading } from './redux/wallet/selectors';
import { WalletStatus } from './redux/wallet/state';
import Loader from './components/UI/Loader';

export const Routes: React.FC = () => {
  usePageViews();
  const walletStatus = useSelector(getWalletStatus);
  const walletLoading = useSelector(isWalletLoading);

  return (
    <Switch>
      <Route exact path="/">
        <HomePage />
      </Route>
      <Route exact path="/stats">
        <StatsPage />
      </Route>
      {walletStatus === WalletStatus.CONNECTED ?
      <>
        <Route path="/account">
          <AccountPage />
        </Route>
        <Route path="/status">
          <StatusPage />
        </Route>
        <Route path="/exchange">
          <ExchangePage />
        </Route>
      </>
        :
        (walletLoading && <Loader text="Loading Ethereum wallet" />)
      }
      {!walletLoading &&
      <Route path="*">
        <Redirect to="/" />
      </Route>
      }
    </Switch>
  );
}
