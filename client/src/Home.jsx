import { Container } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import { isLoggedIn, login } from ".";

function HomePage(props) {
    return (
        <Container fluid>
            <h1 className="page-title home unselectable">SpotiShare</h1>
            {(!isLoggedIn() || JSON.parse(localStorage.getItem("client-data")).body.product != "premium") && (
                <p style={{ width: "100vw", textAlign: "center", position: "absolute", left: 0, bottom: "1em", padding: "1.5em" }}>
                    Spotishare requires Spotify Premium, which lets you play any track, ad-free and with better audio quality. Go to{" "}
                    <a target="__blank" href="https://www.spotify.com/premium">
                        spotify.com/premium
                    </a>{" "}
                    to try it for free.
                </p>
            )}
            {/* TODO: Shouldn't this be a sign out button instead */}
            <button
                onClick={() => {
                    if (!isLoggedIn()) login();
                    else {
                        // uhh
                    }
                }}
                id="sign-in"
            >
                {localStorage.getItem("client-data") && isLoggedIn() ? `Sign out (${JSON.parse(localStorage.getItem("client-data")).body.display_name})` : "Sign In"}
            </button>

            <div style={{ width: "100%", textAlign: "center" }}>
                <button id="create-lobby-btn" onClick={() => (isLoggedIn() ? createLobby() : login())}>
                    Create Lobby
                </button>
            </div>
            <span className="credits">Created by Roseak Lin, Tom Han, Jerry Lin</span>
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
