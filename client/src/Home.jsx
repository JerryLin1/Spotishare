import { Container } from "react-bootstrap";
import { useContext } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import { isLoggedIn, login } from ".";
import { ClientContext } from "./contexts/ClientProvider";

function HomePage(props) {
    return (
        <Container fluid>
            <h1 className="page-title home unselectable">SpotiShare</h1>
            {(!isLoggedIn() || JSON.parse(localStorage.getItem("client-data")).body.product != "premium") && (
                <div style={{ width: "100%", textAlign: "center" }}>
                    Spotishare requires Spotify Premium, which lets you play any track, ad-free and with better audio
                    quality. Go to <a  target= "__blank" href="https://www.spotify.com/premium">spotify.com/premium</a> to try it for free.
                </div>
            )}
            {/* TODO: Shouldn't this be a sign out button instead */}
            <button
                onClick={() => {
                    if (!isLoggedIn()) login();
                }}
                id="sign-in"
            >
                {localStorage.getItem("client-data")
                    ? `Hello ${JSON.parse(localStorage.getItem("client-data")).body.display_name}!`
                    : "Sign In"}
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
