import React from 'react';

import { useCurrenciesContext } from "../hooks/currencies";

export default function AppLoader({ children }) {
  const { currenciesReady } = useCurrenciesContext();

  if(currenciesReady) return children;

  return (
    <div className="global-loader">
      <div className="global-loader-anim">
        <img src="./logo512.png" height="100%" alt="mooni logo loader"/>
      </div>
    </div>
  );
}
