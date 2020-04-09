import BoxManager from '../../lib/box';
import { getETHManager } from '../eth/selectors';
import { getBoxLoading } from './selectors';
import { fetchMyAccount, resetContacts } from '../contacts/actions';
import { track } from '../../lib/analytics';
import { logError } from '../../lib/log';

export const SET_BOX_MANAGER = 'SET_BOX_MANAGER';
export const SET_BOX_LOADING = 'SET_BOX_LOADING';

export const setBoxManager = (boxManager) => ({
  type: SET_BOX_MANAGER,
  payload: {
    boxManager,
  }
});
export const setBoxLoading = (boxLoading) => ({
  type: SET_BOX_LOADING,
  payload: {
    boxLoading,
  }
});

export const initBox = () => async function (dispatch, getState)  {
  dispatch(setBoxLoading(true));
  const ethManager = getETHManager(getState());

  try {
    const boxManager = await BoxManager.init(ethManager);
    const state = getState();
    if(!getBoxLoading(state) || !getETHManager(getState())) { // cancelled or User disconnected while fetching box
      return;
    }
    dispatch(setBoxManager(boxManager));
    await dispatch(fetchMyAccount());
    dispatch(setBoxLoading(false));
    log('Box opened');
    track('BOX: opened');
  } catch(error) {
    logError('Unable to connect to 3box', error);
    dispatch(resetBox());
    throw error;
  }
};

export const cancelInitBox = () => async function (dispatch) {
  log('Box opening cancelled');
  dispatch(resetBox());
}

export const initBoxIfLoggedIn = () => async function (dispatch, getState)  {
  const ethManager = getETHManager(getState());

  if(ethManager && BoxManager.hasAlreadyOpened(ethManager.getAddress())) {
    await dispatch(initBox());
  }
};

export const resetBox = () => function (dispatch)  {
  dispatch(setBoxManager(null));
  dispatch(setBoxLoading(false));
  dispatch(resetContacts());
};
