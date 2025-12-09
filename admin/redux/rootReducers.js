import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/user";
import sidebarReducer from "./slices/sidebar";
import jobReducer from "./slices/job";
import uiReducer from "./slices/ui";
import resourceReducer from "./slices/resources";

import aiReducer from "./slices/ai";

const rootReducer = combineReducers({
  // Add your slice reducers here
  user: userReducer,
  sidebar: sidebarReducer,
  job: jobReducer,
  ui: uiReducer,
  resource: resourceReducer,
  ai: aiReducer,
});

export default rootReducer;