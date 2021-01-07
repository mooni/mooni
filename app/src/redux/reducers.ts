import { combineReducers } from '@reduxjs/toolkit';

import wallet, {STATE_NAME as WALLET_STATE_NAME} from './wallet/reducer';
import payment, {STATE_NAME as PAYMENT_STATE_NAME} from './payment/reducer';
import ui, {STATE_NAME as UI_STATE_NAME} from './ui/reducer';

// import box, {STATE_NAME as BOX_STATE_NAME} from './box/reducer';
// import contacts, {STATE_NAME as CONTACT_STATE_NAME} from './contacts/reducer';

const rootReducer = combineReducers({
  [PAYMENT_STATE_NAME]: payment,
  [WALLET_STATE_NAME]: wallet,
  [UI_STATE_NAME]: ui,

  // [BOX_STATE_NAME]: box,
  // [CONTACT_STATE_NAME]: contacts,
});

export default rootReducer;
