import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App.jsx";

import {
  AdminAuthProvider,
} from "./context/AdminAuthContext.jsx";

import {
  StudentAuthProvider,
} from "./context/StudentAuthContext.jsx";

import "./styles/globals.css";



createRoot(
  document.getElementById(
    "root"
  )
).render(
  <StrictMode>

    <BrowserRouter>

      <AdminAuthProvider>

        <StudentAuthProvider>

          <App />

        </StudentAuthProvider>

      </AdminAuthProvider>

    </BrowserRouter>

  </StrictMode>
);