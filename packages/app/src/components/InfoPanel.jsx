import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SidePanel } from '@aragon/ui'

import About from './About';
import Terms from './Terms';

import { getInfoPanel } from '../redux/ui/selectors';
import { setInfoPanel } from '../redux/ui/actions';

function getPanelTitle(panelType) {
  switch(panelType) {
    case 'about':
      return 'About';
    case 'terms':
      return 'Terms and conditions';
    default:
      return null;
  }
}

function getPanelContent(panelType) {
  switch(panelType) {
    case 'about':
      return <About />;
    case 'terms':
      return <Terms />;
    default:
      return null;
  }
}

export default function InfoPanel() {
  const dispatch = useDispatch();
  const panelType = useSelector(getInfoPanel);

  const panelTitle = getPanelTitle(panelType);
  const panelContent = getPanelContent(panelType);

  if(!panelType) return null;

  return (
    <SidePanel
      title={panelTitle}
      opened
      onClose={() => dispatch(setInfoPanel(null))}
    >
      {panelContent}
    </SidePanel>
  );
}
