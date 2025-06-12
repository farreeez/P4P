import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ModalContextProvider } from "./contexts/ModalContextProvider.jsx";
import { AppContextProvider } from "./contexts/AppContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppContextProvider>
      <ModalContextProvider>
        <App />
      </ModalContextProvider>
    </AppContextProvider>
  </StrictMode>
);
