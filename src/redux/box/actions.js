import BoxManager from '../../lib/box';
import { getConnect } from '../eth/selectors';
import { setMyAccount } from '../contacts/actions';

export const SET_BOX_MANAGER = 'SET_BOX_MANAGER';

export const setBoxManager = (boxManager) => ({
  type: SET_BOX_MANAGER,
  payload: {
    boxManager,
  }
});

export const initBox = () => function (dispatch, getState)  {
  const connect = getConnect(getState());

  BoxManager.init(connect).then(async (boxManager) => {
    dispatch(setBoxManager(boxManager));
  }).catch(error => {
    console.error('Unable to connect to 3box', error);
    dispatch(resetBox());
  });
};

export const resetBox = () => function (dispatch)  {
  dispatch(setBoxManager(null));
  // TODO reset contacts
};
