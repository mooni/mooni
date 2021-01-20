export const SET_INFO_PANEL = 'SET_INFO_PANEL';
export const SET_MODAL_ERROR = 'SET_MODAL_ERROR';

export const setInfoPanel = (panelType) => ({
  type: SET_INFO_PANEL,
  payload: {
    panelType,
  }
});

export const setModalError = (error) => ({
  type: SET_MODAL_ERROR,
  payload: {
    error,
  }
});
