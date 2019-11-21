import { combineReducers } from 'redux';
import eth, {STATE_NAME as ETH_STATE_NAME} from './eth/reducer';
import box, {STATE_NAME as BOX_STATE_NAME} from './box/reducer';
import contacts, {STATE_NAME as CONTACT_STATE_NAME} from './contacts/reducer';

export default combineReducers({
  [ETH_STATE_NAME]: eth,
  [BOX_STATE_NAME]: box,
  [CONTACT_STATE_NAME]: contacts,
});
