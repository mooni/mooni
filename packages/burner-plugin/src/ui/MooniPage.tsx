import React, { useRef, useLayoutEffect } from 'react';
import { PluginPageContext } from '@burner-wallet/types';

import MooniWidget from '@mooni/widget';

import MooniPlugin from '../MooniPlugin';

const MooniPage: React.FC<PluginPageContext> = ({ burnerComponents, plugin }) => {
  const { Page } = burnerComponents;
  const mooniContainer = useRef<HTMLDivElement>(null);
  const _plugin = plugin as MooniPlugin;

  useLayoutEffect(() => {

    if(!mooniContainer.current) return;

    const container = mooniContainer.current;

    new MooniWidget({
      containerElement: container,
      web3Provider: _plugin.getWeb3Provider(),
      appUrl: _plugin.appUrl,
    });

  }, []);

  return (
    <Page title="Cash out">
      <div ref={mooniContainer} style={{flex: 1, display: 'flex'}} />
    </Page>
  );
};

export default MooniPage;
