import React, { useEffect, useState } from 'react';
import { PluginElementContext } from '@burner-wallet/types';
import MooniPlugin from '../MooniPlugin';

const MooniElement: React.FC<PluginElementContext> = ({ plugin }) => {
  return (
    <div>
      <div>Injected plugin element</div>
  </div>
);
};

export default MooniElement;
