import React from 'react';

import { Image } from "@chakra-ui/react";
import { useCurrenciesContext } from "../hooks/currencies";

export default function AppLoader({ children }) {
  const { currenciesReady } = useCurrenciesContext();

  if(currenciesReady) return children;

  return (
    <div className="global-loader">
      <div className="global-loader-anim">
        <Image src="/images/logos/logo_blue_bg.svg" boxSize="100%" alt="mooni logo loader"/>
      </div>
    </div>
  );
}
