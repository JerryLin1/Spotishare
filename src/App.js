import React from "react";
import io from "socket.io-client";
import Client from "./client";

import HomePage from "./Home.jsx";

import "./styles.css";

function App(props) {

    return (
        <div>
            <HomePage />
        </div>
    );
}

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
export default App;
