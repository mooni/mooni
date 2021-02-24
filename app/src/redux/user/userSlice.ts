import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types/api';
import Api from '../../lib/wrappers/mooni';
import { getJWS } from '../wallet/selectors';
import { RootState } from '../store';
import { defaultProvider } from '../../lib/web3Providers';

export const STATE_NAME = 'USER';

interface UserState {
  user: User | null;
  ens: string | null;
}

const initialState: UserState = {
  user: null,
  ens: null,
}

export const userSlice = createSlice({
  name: STATE_NAME,
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setENS: (state, action: PayloadAction<string | null>) => {
      state.ens = action.payload;
    },
  },
});

const { setENS } = userSlice.actions;
export const { setUser } = userSlice.actions;

const fetchENS = (address) => dispatch => {
  defaultProvider.lookupAddress(address)
    .then(ens => dispatch(setENS(ens)))
    .catch(_ => dispatch(setENS(null)))
};

export const fetchUser = () => async (dispatch, getState) => {
  const jwsToken = getJWS(getState())
  const user = await Api.getUser(jwsToken);
  dispatch(setUser(user));
  dispatch(fetchENS(user.ethAddress));
};

export const resetUser = () => async dispatch => {
  dispatch(setUser(null));
  dispatch(setENS(null));
};

export const selectUser = (state: RootState) => state[STATE_NAME].user;
export const selectENS = (state: RootState) => state[STATE_NAME].ens;

export default userSlice.reducer;