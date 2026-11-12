import React from "react";
import { createRoot } from "react-dom/client";
import App, { AdminApp } from "./App.jsx";
import "./styles.css";

const isAdminRoute = window.location.pathname.replace(/\/+$/, "") === "/admin";
const Page = isAdminRoute ? AdminApp : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>,
);
