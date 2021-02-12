import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react"

import About from '../Infos/About';
import Terms from '../Infos/Terms';
import Support from '../Infos/Support';

import { getInfoPanel } from '../../redux/ui/selectors';
import { setInfoPanel } from '../../redux/ui/actions';

function getPanelTitle(panelType) {
  switch(panelType) {
    case 'about':
      return 'About';
    case 'terms':
      return 'Terms and conditions';
    case 'support':
      return 'Support';
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
    case 'support':
      return <Support />;
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
    <Drawer
      isOpen={panelType}
      placement="right"
      size="lg"
      onClose={() => dispatch(setInfoPanel(null))}
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{panelTitle}</DrawerHeader>

          <DrawerBody mt={4} mb={4}>
            {panelContent}
          </DrawerBody>

        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
}
