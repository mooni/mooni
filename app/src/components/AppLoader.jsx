import React, { useContext } from 'react';

import {CurrenciesContext} from "../contexts/CurrenciesContext";

export default function AppLoader({ children }) {
  const { currenciesReady } = useContext(CurrenciesContext);

  if(currenciesReady) return children;

  return (
    <div className="global-loader">
      <div className="global-loader-anim">
        <img src="./logo512.png" height="100%" />
      </div>
    </div>
  );
}
