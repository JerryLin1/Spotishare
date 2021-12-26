import { useState } from "react";

import { Row, Col, Container, Button } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import { isLoggedIn, login } from ".";

function HomePage(props) {
    const [songs, setSongs] = useState(null);

    const renderSongList = () => {
        if (songs === null) {
            return null;
        } else {
            return songs;
        }
    };

    return (
        <Container fluid>
            <button onClick={() => login()} id="sign-in">
                Sign in
            </button>
            <h1 id="title">SpotiShare</h1>

            <div>
                <button onClick={() => (isLoggedIn() ? createLobby() : login())}>Create Lobby</button>
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
