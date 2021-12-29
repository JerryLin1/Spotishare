import { Container } from "react-bootstrap";
import { useContext } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import { isLoggedIn, login } from ".";
import { ClientContext } from "./contexts/ClientProvider";

function HomePage(props) {
    return (
        <Container fluid>
            <h1 className="page-title home unselectable">SpotiShare</h1>
            <button onClick={() => login()} id="sign-in">
                {isLoggedIn() ? `Hello ${JSON.parse(localStorage.getItem("client-data")).body.display_name}!` : "Sign In"}
            </button>

            <div style={{ width: "100%", textAlign: "center" }}>
                <button id="create-lobby-btn" onClick={() => (isLoggedIn() ? createLobby() : login())}>
                    Create Lobby
                </button>
            </div>
        </Container>
    );
}

async function createLobby() {
    fetch(`/createLobby?accessToken=${localStorage.getItem("spotify-access-token")}`)
        .then((e) => e.json())
        .then((data) => (window.location = data.roomId))
        .catch((error) => alert(error));
}

export default HomePage;
