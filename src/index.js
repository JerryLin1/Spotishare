import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, MemoryRouter, Routes } from "react-router-dom";
import HomePage from "./Home";
import Lobby from "./Lobby";
import PreLobby from "./PreLobby";
import "./styles.css";

ReactDOM.render(
    <React.StrictMode>
        <div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/:roomId" element={<PreLobby />}></Route>
					<Route path="/:roomId/Lobby" element={<Lobby />}></Route>
                </Routes>
            </BrowserRouter>
        </div>
    </React.StrictMode>,
    document.getElementById("root")
);

document.addEventListener("DOMContentLoaded", () => {
    if (
        localStorage.getItem("spotify-access-token") &&
        localStorage.getItem("spotify-access-token-expiry") > Date.now()
    ) {
    }
    if (window.location.pathname == "/auth/callback") {
        fetch("/auth/callback" + window.location.search)
            .then((e) => e.json())
            .then((data) => {
                localStorage.setItem("spotify-access-token", data.accessToken);
                localStorage.setItem("spotify-access-token-expiry", Date.now() + data.expiresIn * 990);
                localStorage.setItem("spotify-refresh-token", data.refreshToken);
                window.location = "/";
            });
    }
});
