export const SET_INFO_PANEL = 'SET_INFO_PANEL';

export const setInfoPanel = (panelType) => ({
  type: SET_INFO_PANEL,
  payload: {
    panelType,
  }
});
