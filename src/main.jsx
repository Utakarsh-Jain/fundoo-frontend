import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

/*
 * File Name   : main.jsx
 * Description : Entry point of the React application.
 * Author      : Utakarsh Jain
 * Date        : 25/11/2026
 */

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);