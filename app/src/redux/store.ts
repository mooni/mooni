import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'

import rootReducer from './reducers';
import { logRocketMiddleware } from '../lib/analytics';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logRocketMiddleware),
});

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>() // Export a hook that can be reused to resolve types

export default store;
