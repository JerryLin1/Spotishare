import { useContext, useEffect, useState } from "react";
import React from "react";
import { Row, Col, Container, Card, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CaretDownFill, Spotify } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";

import WebPlayback from "./WebPlayback.jsx";
import Queue from "./Queue.jsx";
import { ClientContext } from "./contexts/ClientProvider.jsx";

import "./css/Lobby.css";
import SearchBar from "./SearchBar.jsx";

function Lobby(props) {
    let { roomId } = useParams();
    const client = useContext(ClientContext);
    const [members, setMembers] = useState([]);
    const [chat, setChat] = useState([]);
    const [queue, updateQueue] = useState([]);

    const renderMembers = () => {
        let newMemberList = [];
        for (const user of members) {
            newMemberList.push(
                <Row className="member-card">
                    <Col id="member-name" style={{ padding: "0" }}>
                        {user.name}
                        {user.isHost && (
                            <svg xmlns="http://www.w3.org/2000/svg" width={36} height={20} viewBox="0 0 512 512" fill="gold">
                                <path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z" />
                            </svg>
                        )}
                    </Col>
                    <Col xs="auto" style={{ padding: "0" }}>
                        <img id="member-pfp" src={user.image} />
                    </Col>
                </Row>
            );
        }

        return newMemberList;
    };

    const initializeUser = () => {
        fetch(`/joinLobby?roomId=${roomId}&accessToken=${localStorage.getItem("spotify-access-token")}&socketid=${client.socket.id}`).then((data) => {
            if (data.status === 200) {
                client.socket.emit("joinRoom", { roomId: roomId, accessToken: localStorage.getItem("spotify-access-token") }, (response) => {
                    client.isHost = response.isHost;
                });
            }
        });
    };

    const addToQueue = (queueItem) => {
        document.getElementsByClassName("dropdown")[0].style.display = "inherit";
        updateQueue((oldQueue) => [...oldQueue, queueItem]);
    };

    const removeFromQueue = (key) => {
        updateQueue((oldQueue) => {
            let newQueue = [...oldQueue];
            newQueue.splice(key, 1);
            return newQueue;
        });
        if (queue.length() === 0) {
            document.getElementsByClassName("dropdown")[0].style.display = "none";
        }
    };

    const toggleDropdown = (dropdown) => {
        const map = { "export-settings": 0, "lobby-list": 1 };
        if (document.getElementsByClassName(`${dropdown}`)[0].classList.contains("visible")) {
            document.getElementsByClassName(`${dropdown}`)[0].className = `${dropdown}`;
            document.getElementsByClassName("caret")[map[`${dropdown}`]].style.transform = "translateY(-50%) rotate(0deg)";
        } else {
            document.getElementsByClassName(`${dropdown}`)[0].className = `${dropdown} visible`;
            document.getElementsByClassName("caret")[map[`${dropdown}`]].style.transform = "translateY(-50%) rotate(-180deg)";
        }
    };

    useEffect(() => {
        initializeUser();

        client.socket.on("addQueueItem", (newQueueItem) => {
            addToQueue(newQueueItem);
        });

        client.socket.on("removeQueueItem", ({ key }) => {
            removeFromQueue(key);
        });

        client.socket.on("receiveMessage", ({ msg, type, userName, userId }) => {
            const chat = document.getElementById("chat");

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

    return (
        <Container fluid>
            <Row>
                <Col xs={12} xl={3}>
                    <h1 className="page-title unselectable">SpotiShare</h1>
                </Col>
                <Col xs={12} xl={{ offset: 1, span: 5 }} style={{ marginTop: "1em" }}>
                    <SearchBar />
                </Col>
                <Col xs={12} xl={3}>
                    <div id="roomCode">
                        <strong>Room invite link: </strong>
                        <RoomCode />
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12} xl={3}>
                    <Queue queue={queue} />
                    <div className="dropdown unselectable" onClick={() => toggleDropdown("export-settings")} style={{ display: "none" }}>
                        Export Playlist
                        <CaretDownFill className="caret" />
                    </div>
                    <div className="export-settings">
                        <button>
                            Export to Spotify playlist <Spotify className="spotify-logo" />
                        </button>
                        <button>
                            Export others' songs to Spotify playlist <Spotify className="spotify-logo" />
                        </button>
                    </div>
                </Col>
                <Col xs={12} xl={6}>
                    <WebPlayback roomId={roomId} disabled={client.isHost} token={localStorage.getItem("spotify-access-token")} />
                </Col>
                <Col xs={12} xl={3}>
                    <Card className="chat-container">
                        <Card.Header id="chat-header" className="unselectable">
                            Chat
                        </Card.Header>
                        <div className="dropdown unselectable" onClick={() => toggleDropdown("lobby-list")}>
                            <p style={{ margin: "0" }}>Currently listening ({members ? members.length : 0})</p>
                            <CaretDownFill className="caret" />
                        </div>
                        <div className="lobby-list">{renderMembers()}</div>
                        <Card.Body id="chat">{chat}</Card.Body>
                    </Card>
                    <Form
                        autoComplete="off"
                        onSubmit={(event) => {
                            event.preventDefault();
                            client.sendMessage(formatMessage(document.getElementById("chatInput").value));
                            document.getElementById("chatInput").value = "";
                        }}
                    >
                        <div id="sendBar">
                            <input placeholder="Type a message..." type="text" id="chatInput" />
                            <button variant="outline-dark" type="submit" id="sendBtn">
                                Send Message
                            </button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}

// modified from: https://react-bootstrap.netlify.app/components/overlays/#tooltips
const UpdatingTooltip = React.forwardRef(({ popper, children, show: _, ...props }, ref) => {
    useEffect(() => {
        popper.scheduleUpdate();
    }, [children, popper]);
    return (
        <Tooltip ref={ref} body {...props}>
            {children}
        </Tooltip>
    );
});

const RoomCode = () => {
    const [content, setContent] = useState("Copy Code");
    return (
        <OverlayTrigger placement="bottom" overlay={<UpdatingTooltip>{content}</UpdatingTooltip>}>
            <span
                onClick={() => {
                    navigator.clipboard.writeText(window.location.href.substring(0, window.location.href.indexOf("lobby") - 1));
                    setContent("Code Copied!");
                }}
                onMouseLeave={() => setTimeout(() => setContent("Copy Code"), 250)}
            >
                {window.location.href.substring(0, window.location.href.indexOf("lobby") - 1)}
            </span>
        </OverlayTrigger>
    );
};

// modified from https://stackoverflow.com/a/8943487
function processChatMessage(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlRegex, function (url) {
        return `<a target="_blank" href="${url}"> ${url} </a>`;
    });
}

function formatMessage(msg) {
    return msg.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export default Lobby;
