import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/api';
import Api from '../../lib/api';
import {getJWS} from '../wallet/selectors';
import { RootState } from '../store';

export const STATE_NAME = 'USER';

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null,
}

export const userSlice = createSlice({
  name: STATE_NAME,
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;

export const fetchUser = () => async (dispatch, getState) => {
  const jwsToken = getJWS(getState())
  const user = await Api.getUser(jwsToken);
  dispatch(setUser(user));
};

export const selectUser = (state: RootState) => state[STATE_NAME].user;

export default userSlice.reducer;