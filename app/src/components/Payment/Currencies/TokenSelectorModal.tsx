import React  from 'react';
import {useSelector} from 'react-redux';

import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemAvatar, ListItemText, Avatar } from '@material-ui/core';

import { getInputCurrencies } from '../../../redux/ui/selectors';
import { CurrencyLogo } from './CurrencyLogo';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelectToken: (CurrencySymbol) => void;
};
export const TokenSelectorModal: React.FC<Props> = ({ open, onClose, onSelectToken }) => {
  const inputCurrencies = useSelector(getInputCurrencies);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
    >
      <DialogTitle>Select token</DialogTitle>
      <DialogContent>
        <List>
          {inputCurrencies.map(symbol => (
            <ListItem key={symbol} button onClick={() => onSelectToken(symbol)}>
              <ListItemAvatar>
                <Avatar>
                  <CurrencyLogo symbol={symbol}/>
                </Avatar>
              </ListItemAvatar>
              <ListItemText>
                {symbol}
              </ListItemText>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
