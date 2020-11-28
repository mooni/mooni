import { combineReducers } from 'redux';
import eth, {STATE_NAME as ETH_STATE_NAME} from './eth/reducer';
import box, {STATE_NAME as BOX_STATE_NAME} from './box/reducer';
import contacts, {STATE_NAME as CONTACT_STATE_NAME} from './contacts/reducer';
import payment, {STATE_NAME as PAYMENT_STATE_NAME} from './payment/reducer';
import ui, {STATE_NAME as UI_STATE_NAME} from './ui/reducer';

const rootReducer = combineReducers({
  [ETH_STATE_NAME]: eth,
  [BOX_STATE_NAME]: box,
  [CONTACT_STATE_NAME]: contacts,
  [PAYMENT_STATE_NAME]: payment,
  [UI_STATE_NAME]: ui,
});

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer;

