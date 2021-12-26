import { useState } from "react";

import { Row, Col, Container, Button } from "react-bootstrap";

import json from "./temp.json";

import "bootstrap/dist/css/bootstrap.min.css";

function HomePage(props) {
    const [members, setMembers] = useState(["Royeek", "Yom", "Yerry"]);
    const [songs, setSongs] = useState(null);
    const [queue, updateQueue] = useState([]);

    const renderMembers = () => {
        return (
            <div>
                {members.map((member, key) => {
                    if (member === "Royeek") {
                        return (
                            <div className="member-card" key={key}>
                                {member}{" "}
                                <svg xmlns="http://www.w3.org/2000/svg" width={36} height={20} viewBox="0 0 512 512" fill="gold">
                                    <path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z" />
                                </svg>
                            </div>
                        );
                    }
                    return (
                        <div className="member-card" key={key}>
                            {member}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderSongList = () => {
        if (songs === null) {
            return null;
        } else {
            return songs;
        }
    };

    const addToQueue = (song) => {
        let newQueue = queue.slice();
        queue.push(song);
        newQueue.push(song);
        updateQueue(newQueue);
        console.log(queue);
    };

    return (
        <Container fluid>
            <Button
                onClick={() => login()}
                id="sign-in"
            >
                Sign in
            </Button>
            <h1 id="title">SpotiShare</h1>

            <div>
                <button onClick={() => isLoggedIn() ? createLobby() : login()}>
                    Create Lobby
                </button>
            </div>

            <Row style={{ margin: "3em 1.5em 0 1.5em" }}>
                <Col xs="5">
                    <h3>Current Listening Party Members:</h3>
                    <div>{renderMembers()}</div>
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
                                                                addToQueue(
                                                                    JSON.parse(
                                                                        `{"id":"${e.id}","name":"${e.name}","artists":"${e.artists}","img":"${e.album.images[0]}"}`
                                                                    )
                                                                );
                                                                // addToQueue(JSON.parse('{"name":"John", "age":30, "city":"New York"}'));
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
                        if (key === 0) {
                            return (
                                <div key={key}>
                                    <h4>Currently Playing:</h4>
                                    {/* <iframe
                                        src={`https://open.spotify.com/embed/track/${item.id}?utm_source=generator`}
                                        width="100%"
                                        height="80"
                                        frameBorder="0"
                                        allowFullScreen=""
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    ></iframe> */}
                                    {item.name} by{" "}
                                    {() => {
                                        artists = []
                                        for (let i = 0; i < item.artists.length - 1; i++) {
                                            artists.push(`${item.artists[0]}, `)
                                        }
                                            artists.push(`${item.artists[item.artists.length - 1]}`)
                                    }}
                                    <h4>Next in Queue:</h4>
                                </div>
                            );
                        } else {
                            return (
                                <div key={key}>
                                    <iframe
                                        src={`https://open.spotify.com/embed/track/${item.id}?utm_source=generator`}
                                        width="100%"
                                        height="80"
                                        frameBorder="0"
                                        allowFullScreen=""
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    ></iframe>
                                </div>
                            );
                        }
                    })}
                </div>
            </div>
        </Container>
    );
}

function isLoggedIn() {
    return localStorage.getItem("spotify-access-token") && localStorage.getItem("spotify-access-token-expiry") > Date.now();
}
async function login() {
    fetch("/auth/login")
        .then((e) => e.json())
        .then((data) => {
            window.location = data.redirectUri;
        })
        .catch((error) => {
            console.log("Failed to prepare for Spotify Authentication");
        });
}

async function createLobby() {
    fetch(`/createLobby?accessToken=${localStorage.getItem("spotify-access-token")}`)
        .then((e) => e.json())
        .then((data) => window.location = data.roomId)
        .catch((error) => alert(error));
}

export default HomePage;
