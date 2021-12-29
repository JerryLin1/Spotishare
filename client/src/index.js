import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, MemoryRouter, Routes } from "react-router-dom";
import { ClientProvider } from "./contexts/ClientProvider";
import HomePage from "./Home";
import Lobby from "./Lobby";
import PreLobby from "./PreLobby";

import "./css/styles.css";

ReactDOM.render(
    <React.StrictMode>
        <ClientProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/:roomId" element={<PreLobby />}></Route>
                    <Route path="/:roomId/Lobby" element={<Lobby />}></Route>
                </Routes>
            </BrowserRouter>
        </ClientProvider>
    </React.StrictMode>,
    document.getElementById("root")
);

document.addEventListener("DOMContentLoaded", () => {
    if (
        localStorage.getItem("spotify-access-token") &&
        localStorage.getItem("spotify-access-token-expiry") > Date.now()
    ) {
        //TODO: Tell user to login?
    }
    if (window.location.pathname == "/auth/callback") {
        fetch("/auth/aftercallback" + window.location.search)
            .then((e) => e.json())
            .then((data) => {
                console.log(data);
                console.log(localStorage.getItem("prev-location"));
                localStorage.setItem("spotify-access-token", data.accessToken);
                localStorage.setItem("spotify-access-token-expiry", Date.now() + data.expiresIn * 990);
                localStorage.setItem("spotify-refresh-token", data.refreshToken);
                localStorage.setItem("client-data", JSON.stringify(data.clientData));
                window.location = localStorage.getItem("prev-location") || "/";
            });
    }
});

export function isLoggedIn() {
    return (
        localStorage.getItem("spotify-access-token") && localStorage.getItem("spotify-access-token-expiry") > Date.now()
    );
}
export async function login() {
    fetch("/auth/login")
        .then((e) => e.json())
        .then((data) => {
            localStorage.setItem("prev-location", window.location);
            window.location = data.redirectUri;
        })
        .catch((error) => {
            alert(error);
        });
}
