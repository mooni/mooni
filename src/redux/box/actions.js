import BoxManager from '../../lib/box';
import { getETHManager } from '../eth/selectors';

export const SET_BOX_MANAGER = 'SET_BOX_MANAGER';

export const setBoxManager = (boxManager) => ({
  type: SET_BOX_MANAGER,
  payload: {
    boxManager,
  }
});

export const initBox = () => async function (dispatch, getState)  {
  const ethManager = getETHManager(getState());

  try {
    const boxManager = await BoxManager.init(ethManager);
    dispatch(setBoxManager(boxManager));
  } catch(error) {
    console.error('Unable to connect to 3box', error);
    dispatch(resetBox());
  }
};

export const resetBox = () => function (dispatch)  {
  dispatch(setBoxManager(null));
  // TODO reset contacts
};
