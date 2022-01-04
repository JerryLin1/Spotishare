import { useContext, useEffect, useRef, useState } from "react";
import { Row, Col, Container, Card, Form } from "react-bootstrap";
import { CaretDownFill } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";

import WebPlayback from "./WebPlayback.jsx";
import Queue from "./Queue.jsx";
import { ClientContext } from "./contexts/ClientProvider.jsx";

import anime from "animejs";

import "./css/Lobby.css";

function Lobby(props) {
    let { roomId } = useParams();
    const client = useContext(ClientContext);
    const [members, setMembers] = useState([]);
    const [chat, setChat] = useState([]);
    const [queue, updateQueue] = useState([]);
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
                    <Col style={{ display: "flex", justifyContent: "right", alignItems: "center", padding: "0" }}>
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
        updateQueue((oldQueue) => [...oldQueue, queueItem]);
    };

    const removeFromQueue = (key) => {
        updateQueue((oldQueue) => {
            let newQueue = [...oldQueue];
            newQueue.splice(key,1);
            return newQueue;
        });
    };

    // search area expand animation
    const expandSearchArea = () => {
        /**********  TODO: fix random re-expand when clicking on song card **********/
        let searchArea = document.querySelector("#searchArea"),
            searchBox = document.querySelector("#searchbox");
        if (window.innerWidth <= 1200) {
            searchArea.style.cssText = `position: fixed !important; width: 100vw; height: 100%; top: 0; background-color: rgba(25,25,25,0.75)`;
            searchBox.style.cssText = "left: 50vw; transform: translateX(-50%); width: 60%";

            document.querySelector("#result-list").style.cssText = "opacity: 1; display: block";
            document.querySelector("#searchArea-close").style.display = "block";
        } else {
            searchArea.style.cssText = "position: fixed !important; width: 100vw; height: 12em";
            searchBox.style.cssText = "left: 50vw; transform: translateX(-50%)";

            anime({
                targets: searchArea,
                height: `${window.innerHeight / 16}em`,
                width: "100vw",
                backgroundColor: "rgba(33,33,33,0.75)",
                easing: "linear",
                duration: 250,
            });

            anime({
                targets: searchBox,
                width: ["calc(33.33333% - 4em)", "60%"],
                easing: "linear",
                duration: 250,
                complete: () => {
                    document.querySelector("#result-list").style.display = "block";
                    anime({ targets: "#result-list", opacity: 1, duration: 100, easing: "linear" });
                    if (window.innerHeight > 700) {
                        document.querySelector("#searchArea-close").style.display = "block";
                    }
                },
            });
        }
    };

    // search collapse area animation
    const shrinkSearchArea = () => {
        let searchArea = document.querySelector("#searchArea"),
            searchBox = document.querySelector("#searchbox");
        document.querySelector("#searchArea-close").style.display = "none";
        if (window.innerWidth <= 1200) {
            // TODO: don't play animation and just expand searcharea
            document.querySelector("#result-list").style.cssText = "opacity: 0; display: none";
            searchArea.style.cssText = "position: relative; width: 100%; height: 0";
            searchBox.style.cssText = "left: 0; transform: none; width: 80%";
        } else {
            anime({ targets: "#result-list", opacity: 0, duration: 100, easing: "linear" });
            document.querySelector("#result-list").style.display = "none";

            anime({
                targets: searchArea,
                height: [`${window.innerHeight / 16}em`, "12em"],
                backgroundColor: "rgba(0,0,0,0)",
                easing: "linear",
                duration: 250,
                complete: () => {
                    searchArea.style.cssText = "position: relative; width: 100%; height: 0";
                },
            });

            anime({
                targets: searchBox,
                width: "calc(33.33333% - 4em)",
                easing: "linear",
                duration: 250,
                complete: () => {
                    searchBox.style.cssText = "left: 0; transform: none; width: 80%";
                },
            });
        }
    };

    useEffect(() => {
        initializeUser();

        client.socket.on("addQueueItem", ( newQueueItem ) => {
            addToQueue(newQueueItem);
        });

        client.socket.on("removeQueueItem", ({ key }) => {
            removeFromQueue(key);
        })

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

    const toggleDropdown = (dropdown) => {
        if (dropdown === "export") {
            if (document.getElementsByClassName("lobby-list")[0].classList.contains("visible")) {
                document.getElementsByClassName("lobby-list")[0].className = "lobby-list";
                document.querySelector("#caret").style.transform = "translateY(-50%) rotate(0deg)";
            } else {
                document.getElementsByClassName("lobby-list")[0].className = "lobby-list visible";
                document.querySelector("#caret").style.transform = "translateY(-50%) rotate(-180deg)";
            }
        } else {
            if (document.getElementsByClassName("lobby-list")[0].classList.contains("visible")) {
                document.getElementsByClassName("lobby-list")[0].className = "lobby-list";
                document.querySelector(".card #caret").style.transform = "translateY(-50%) rotate(0deg)";
            } else {
                document.getElementsByClassName("lobby-list")[0].className = "lobby-list visible";
                document.querySelector(".card #caret").style.transform = "translateY(-50%) rotate(-180deg)";
            }
        }
    };

    return (
        <Container fluid>
            <Row>
                <Col xs={12} xl={3}>
                    <h1 className="page-title unselectable">SpotiShare</h1>
                </Col>
                <Col xs={12} xl={{ offset: 1, span: 5 }} style={{ marginTop: "1em" }}>
                    <div id="searchArea-close" onClick={shrinkSearchArea}>
                        &times;
                    </div>
                    <div
                        onClick={(e) => {
                            if (document.querySelector("#result-list").style.opacity !== "1") {
                                expandSearchArea();
                            } else if (e.target.id === "searchArea") {
                                shrinkSearchArea();
                            }
                        }}
                        id="searchArea"
                    >
                        <input
                            autoComplete="off"
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
                        <div id="result-list">
                            {searchResults.map((item, key) => {
                                return (
                                    <Row key={key} className="song-card">
                                        <Col xs={12} xl={9} style={{ padding: "0.5em" }}>
                                            <Row style={{ width: "100%" }}>
                                                <Col xs={6}>
                                                    <div style={{ margin: "0.5em", textAlign: "center" }}>
                                                        <img className="unselectable" src={item.album.images[1].url} />
                                                        {String(item.duration_ms / 60000)[0]}:
                                                        {Math.floor((item.duration_ms / 60000 - Math.floor(item.duration_ms / 60000)) * 60) >= 10
                                                            ? Math.floor((item.duration_ms / 60000 - Math.floor(item.duration_ms / 60000)) * 60)
                                                            : `0${Math.floor(
                                                                  (item.duration_ms / 60000 - Math.floor(item.duration_ms / 60000)) * 60
                                                              )}`}
                                                    </div>
                                                </Col>
                                                <Col xs={{ offset: 1, span: 5 }} xl={{ offset: 0, span: 6 }}>
                                                    <div className="song-card-name">{item.name}</div>
                                                    <div className="song-card-artist">{item.artists.map((artist) => artist.name).join(", ")}</div>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col>
                                            <button
                                                onClick={() => {
                                                    client.socket.emit("addToQueue", {
                                                        track: item,
                                                        user: JSON.parse(localStorage.getItem("client-data")).body.display_name,
                                                        newQueueItem: [item, JSON.parse(localStorage.getItem("client-data")).body.display_name],
                                                    });
                                                }}
                                            >
                                                Add
                                            </button>
                                        </Col>
                                    </Row>
                                );
                            })}
                        </div>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col xs={12} xl={3}>
                    <Queue queue={queue} />
                    {/* Exact same dropdown from lobby */}
                    <div className="dropdown unselectable" onClick={() => toggleDropdown("export")}>
                        <p style={{ margin: "0" }}>Export Playlist</p>
                        <CaretDownFill id="caret" />
                    </div>
                    <div className="export-settings">LOLOL</div>
                </Col>
                <Col xs={12} xl={6}>
                    <WebPlayback roomId={roomId} disabled={client.isHost} token={localStorage.getItem("spotify-access-token")} />
                </Col>
                <Col xs={12} xl={3}>
                    <Card className="chat-container">
                        <Card.Header id="chat-header" className="unselectable">
                            Chat
                        </Card.Header>
                        <div className="dropdown unselectable" onClick={() => toggleDropdown("members")}>
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

// modified from https://stackoverflow.com/a/8943487
function processChatMessage(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return text.replace(urlRegex, function (url) {
        return `<a target="_blank" href="${url}"> ${url} </a>`;
    });
}

export default Lobby;
