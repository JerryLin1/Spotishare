import { useState } from "react";

import { Row, Col, Container, Button } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";
import { isLoggedIn, login } from ".";

function HomePage(props) {
    const [songs, setSongs] = useState(null);
    const [queue, updateQueue] = useState(["3dPtXHP0oXQ4HCWHsOA9js?si=8593d745abde4cb7", "185Wm4Mx09dQG0fUktklDm?si=8fd67a8eb5f04c99"]);

    const renderSongList = () => {
        if (songs === null) {
            return null;
        } else {
            return songs;
        }
    };

    const addToQueue = (id) => {
        let newQueue = queue.slice();
        queue.push(id);
        newQueue.push(id);
        updateQueue(newQueue);
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

            <Row style={{ margin: "3em 1.5em 0 1.5em" }}>
                <Col xs="5">
                    <p>lol</p>
                </Col>
                <Col xs="1"></Col>
                <Col>
                    <div id="searchArea">
                        <input id="searchbox" type="text" placeholder="Artist, Song Name, Album..." />
                        <button id="search-btn">Search!</button>
                    </div>
                    <button
                        style={{
                            width: "-webkit-fill-available",
                            marginBottom: "0.5em",
                        }}
                        onClick={() => {
                            if (isLoggedIn()) {
                                // just testing api stuff
                                fetch(`/top?accessToken=${localStorage.getItem("spotify-access-token")}`)
                                    .then((e) => e.json())
                                    .then((data) => {
                                        console.log(data);
                                        setSongs(
                                            <div>
                                                {data.items.map((e) => (
                                                    <div className="song-card">
                                                        <iframe
                                                            src={`https://open.spotify.com/embed/track/${e.id}?utm_source=generator`}
                                                            width="75%"
                                                            height="80"
                                                            frameBorder="0"
                                                            allowFullScreen=""
                                                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                        ></iframe>
                                                        <button
                                                            onClick={() => {
                                                                addToQueue(e.id);
                                                            }}
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        login();
                                    });
                            } else {
                                login();
                            }
                        }}
                    >
                        Show Your Songs
                    </button>

                    <div id="song-list">{renderSongList()}</div>
                </Col>
            </Row>
            <div id="queue">
                <h2 id="queue-title">Song Queue</h2>
                <div id="queue-container">
                    {queue.map((item, key) => {
                        return (
                            <div key={key}>
                                <iframe
                                    src={`https://open.spotify.com/embed/track/${item}?utm_source=generator`}
                                    width="100%"
                                    height="80"
                                    frameBorder="0"
                                    allowFullScreen=""
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                ></iframe>
                            </div>
                        );
                    })}
                </div>
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
