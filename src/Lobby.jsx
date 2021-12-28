import { useContext, useEffect, useRef, useState } from "react";
import { Row, Col, Container, Card, Form, Button } from "react-bootstrap";
import { CaretDownFill, CaretUpFill } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";

import Client from "./client.js";
import WebPlayback from "./WebPlayback.jsx";
import Queue from "./Queue.jsx";
import { ClientContext } from "./contexts/ClientProvider.jsx";

import { isLoggedIn, login } from ".";

import "./css/Lobby.css";

function Lobby(props) {
    let { roomId } = useParams();
    const client = useContext(ClientContext);
    const [members, setMembers] = useState([]); //useState([{ isHost: true, name: 'Tom Han', id: 'p.han.tom', country: 'CA', image: 'https://i.scdn.co/image/ab6775700000ee8508f4b5251c39729ba880fb66' }]);
    const [chat, setChat] = useState([]);
    const [queue, updateQueue] = useState([
        "3dPtXHP0oXQ4HCWHsOA9js?si=8593d745abde4cb7",
        "3dPtXHP0oXQ4HCWHsOA9js?si=8593d745abde4cb7",
        "185Wm4Mx09dQG0fUktklDm?si=8fd67a8eb5f04c99",
        "3dPtXHP0oXQ4HCWHsOA9js?si=8593d745abde4cb7",
        "185Wm4Mx09dQG0fUktklDm?si=8fd67a8eb5f04c99",
        "185Wm4Mx09dQG0fUktklDm?si=8fd67a8eb5f04c99",
    ]);
    const [typingTimeout, updateTypingTimeout] = useState(undefined);
    const [searchResults, setSearchResults] = useState([]);

    const searchInputRef = useRef(null);

    const renderMembers = () => {
        let newMemberList = [];
        for (const user of members) {
            newMemberList.push(
                <Row className="member-card">
                    <Col id="member-name">
                        {user.name}
                        {user.isHost && (
                            <svg xmlns="http://www.w3.org/2000/svg" width={36} height={20} viewBox="0 0 512 512" fill="gold">
                                <path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z" />
                            </svg>
                        )}
                    </Col>
                    <Col style={{ display: "flex", justifyContent: "right", padding: "0" }}>
                        <div id="pfp-container">
                            <img id="member-pfp" src={user.image} />
                        </div>
                    </Col>
                </Row>
            );
        }

        return newMemberList;
    };

    const initializeUser = () => {
        fetch(`/joinLobby?roomId=${roomId}&accessToken=${localStorage.getItem("spotify-access-token")}&socketid=${client.socket.id}`).then((data) => {
            if (data.status === 200) {
                client.socket.emit("joinRoom", { roomId: roomId }, (response) => {
                    client.isHost = response.isHost;
                });
            }
        });
    };

    const addToQueue = (id) => {
        let newQueue = queue.slice();
        queue.push(id);
        newQueue.push(id);
        updateQueue(newQueue);
    };

    useEffect(() => {
        initializeUser();

        client.socket.on("receiveMessage", ({ msg, type, userName, userId }) => {
            const chat = document.getElementById("chat");

            // console.log(chat.scrollTop + chat.clientHeight, chat.scrollHeight);
            if (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 200) chat.scrollTop = chat.scrollHeight;

            setChat((oldChat) => [
                ...oldChat,
                <div>
                    {type == "USER" && (
                        <span>
                            <strong>{userName}</strong>:
                        </span>
                    )}{" "}
                    <span dangerouslySetInnerHTML={{ __html: processChatMessage(msg) }} />
                </div>,
            ]);
        });

        client.socket.on("updateClientList", (clients) => {
            client.clientsInRoom = clients;
            setMembers(Object.values(clients));
        });
    }, []);

    const toggleLobbyList = () => {
        if (document.getElementsByClassName("lobby-list")[0].classList.contains("visible")) {
            document.getElementsByClassName("lobby-list")[0].className = "lobby-list";
            document.getElementById("caret").style.transform = "translateY(-50%) rotate(0deg)";
        } else {
            document.getElementsByClassName("lobby-list")[0].className = "lobby-list visible";
            document.getElementById("caret").style.transform = "translateY(-50%) rotate(180deg)";
        }
    };

    return (
        <Container fluid>
            <div className="page-title unselectable">SpotiShare</div>
            <Row>
                <Col xl="8">
                    <WebPlayback roomId={roomId} disabled={client.isHost} token={localStorage.getItem("spotify-access-token")} />
                </Col>
                <Col>
                    <Card className="chat-container">
                        <Card.Header id="chat-header" className="unselectable">
                            Chat
                        </Card.Header>
                        <div className="dropdown unselectable" onClick={toggleLobbyList}>
                            <p style={{ margin: "0" }}>Currently listening ({members ? members.length : 0})</p>
                            <CaretDownFill id="caret" />
                        </div>
                        <div className="lobby-list">{renderMembers()}</div>
                        <Card.Body id="chat">{chat}</Card.Body>
                    </Card>
                    <Form
                        autoComplete="off"
                        onSubmit={(event) => {
                            event.preventDefault();
                            client.sendMessage(document.getElementById("chatInput").value);
                            document.getElementById("chatInput").value = "";
                        }}
                    >
                        <div id="sendBar">
                            <input placeholder="Type a message..." type="text" id="chatInput" />
                            <Button variant="outline-dark" type="submit" id="sendBtn">
                                Send Message
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col xs="6" xl="8" id="queue">
                    <Queue queue={queue} />
                </Col>
                <Col id="search-conatiner">
                    <div id="searchArea">
                        <h3 className="unselectable">Find a Song!</h3>
                        <input
                            ref={searchInputRef}
                            onInput={() => {
                                clearTimeout(typingTimeout);
                                updateTypingTimeout(
                                    setTimeout(() => {
                                        fetch(
                                            `/search?value=${searchInputRef.current.value}&accessToken=${localStorage.getItem(
                                                "spotify-access-token"
                                            )}`
                                        )
                                            .then((e) => e.json())
                                            .then((data) => {
                                                setSearchResults(data);
                                            });
                                    }, 500)
                                );
                            }}
                            id="searchbox"
                            type="text"
                            placeholder="Artist, Song Name, Album..."
                        />
                        <button id="search-btn">Search!</button>
                        <div id="result-list">
                            {searchResults.map((item, key) => {
                                return (
                                    <Row key={key} className="song-card">
                                        <Col xs={10}>
                                            <iframe
                                                src={`https://open.spotify.com/embed/track/${item.id}?utm_source=generator`}
                                                width="100%"
                                                height="80"
                                                frameBorder="0"
                                                allowFullScreen=""
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                            ></iframe>
                                        </Col>
                                        <Col style={{ display: "flex", alignItems: "center", padding: "0" }}>
                                            <button>Add</button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

// modified from https://stackoverflow.com/a/8943487
function processChatMessage(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlRegex, function (url) {
        return `<a target="_blank" href="${url}"> ${url} </a>`;
    });
}

export default Lobby;
