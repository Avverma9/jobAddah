import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// Use the combined rootReducer for clearer structure and easier extension
export const store = configureStore({
  reducer: rootReducer,
});
