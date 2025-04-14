import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "zmp-ui/zaui.css";
import "@/css/tailwind.css";
import "@/css/app.scss";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
