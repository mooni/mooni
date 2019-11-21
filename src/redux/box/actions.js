export const SET_BOX_MANAGER = 'SET_BOX_MANAGER';

export const setBoxManager = (boxManager) => ({
  type: SET_BOX_MANAGER,
  payload: {
    boxManager,
  }
});
