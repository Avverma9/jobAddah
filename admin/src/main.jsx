import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import store from "../redux/store.js";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { setAuthenticated } from "../redux/slices/user.js";

const checkAuth = () => {
  const token = localStorage.getItem("token");
  if (token) {
    store.dispatch(setAuthenticated(true));
  }
};

checkAuth();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
