import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { CategoriesProvider } from "./context/CategoriesContext.jsx";
import { ConfirmProvider } from "./context/ConfirmContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfirmProvider>
        <CategoriesProvider>
          <App />
        </CategoriesProvider>
      </ConfirmProvider>
    </BrowserRouter>
  </React.StrictMode>
);
