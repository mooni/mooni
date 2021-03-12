import { STATE_NAME } from './reducer'
import { RootState } from '../store'

export const getInfoPanel = (state: RootState) => state[STATE_NAME].panelType
export const getModalError = (state: RootState) => state[STATE_NAME].modalError
