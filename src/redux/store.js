import { configureStore } from '@reduxjs/toolkit';
import eventReducer from './eventSlice';
import goalReducer from './goalSlice';

export const store = configureStore({
  reducer: {
    event: eventReducer,
    goal: goalReducer,
  },
});
