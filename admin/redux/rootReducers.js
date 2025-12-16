import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/user";
import sidebarReducer from "./slices/sidebar";
import jobReducer from "./slices/job";
import uiReducer from "./slices/ui";

import aiReducer from "./slices/ai";

const rootReducer = combineReducers({
  user: userReducer,
  sidebar: sidebarReducer,
  job: jobReducer,
  ui: uiReducer,
  ai: aiReducer,
});

export default rootReducer;
