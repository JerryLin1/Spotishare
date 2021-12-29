import { Container } from "react-bootstrap";
import { useContext } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import { isLoggedIn, login } from ".";
import { ClientContext } from "./contexts/ClientProvider";

function HomePage(props) {
    let client = useContext(ClientContext);
    console.log(client);

    return (
        <Container fluid>
            <h1 className="page-title home unselectable">SpotiShare</h1>
            <button onClick={() => login()} id="sign-in">
                {isLoggedIn() ? `Signed In!` : "Sign In"}
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
