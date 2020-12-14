import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import thunk from 'redux-thunk';

import rootReducer from './reducers';
import { logRocketMiddleware } from '../lib/analytics';

export const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk, logRocketMiddleware] as const,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logRocketMiddleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
