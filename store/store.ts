import { configureStore } from '@reduxjs/toolkit';
import templateReducer from './slices/templateSlice';
import settingsReducer from './slices/settingsSlice';
import accessRequestReducer from './slices/accessRequestSlice';
import runReducer from './slices/runSlice';

export const store = configureStore({
  reducer: {
    templates: templateReducer,
    settings: settingsReducer,
    accessRequests: accessRequestReducer,
    runs: runReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
