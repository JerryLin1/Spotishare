import { useState, useRef, useContext } from "react";
import { Row, Col } from "react-bootstrap";
import anime from "animejs";

import "./css/SearchBar.css";

import { ClientContext } from "./contexts/ClientProvider.jsx";

function SearchBar(props) {
    const [typingTimeout, updateTypingTimeout] = useState(undefined);
    const [searchResults, setSearchResults] = useState([]);

    const client = useContext(ClientContext);
    const searchInputRef = useRef(null);

    // search area expand animation
    const expandSearchArea = () => {
        let searchArea = document.querySelector("#searchArea"),
            searchBox = document.querySelector("#searchBox");
        if (window.innerWidth <= 1200) {
            searchArea.style.cssText = `position: fixed !important; width: 100vw; height: 100%; top: 0; background-color: rgba(25,25,25,0.75)`;
            searchBox.style.cssText = "position: absolute; left: 50%; transform: translateX(-50%); width: 60%";

            document.querySelector("#result-list").style.cssText = "opacity: 1; display: block";
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
            searchBox = document.querySelector("#searchBox");
        document.querySelector("#searchArea-close").style.display = "none";
        if (window.innerWidth <= 1200) {
            document.querySelector("#result-list").style.cssText = "opacity: 0; display: none";
            searchArea.style.cssText = "position: relative; width: 100%; text-align: center";
            searchBox.style.cssText = "transform: none; width: 80%";
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

    return (
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
            <div id="searchArea-close" onClick={shrinkSearchArea}>
                &times;
            </div>
            <input
                autoComplete="off"
                ref={searchInputRef}
                onInput={() => {
                    clearTimeout(typingTimeout);
                    if (searchInputRef.current.value === "") {
                        return;
                    }
                    updateTypingTimeout(
                        setTimeout(() => {
                            fetch(`/search?value=${searchInputRef.current.value}&accessToken=${localStorage.getItem("spotify-access-token")}`)
                                .then((e) => e.json())
                                .then((data) => {
                                    setSearchResults(data);
                                });
                        }, 500)
                    );
                }}
                id="searchBox"
                type="text"
                placeholder="Artist, Song Name, Album..."
            />
            <div id="result-list">
                {searchResults.map((item, key) => {
                    return (
                        <Row key={key} className="song-card">
                            <Col xs={12} xl={9}>
                                <Row style={{ width: "100%" }}>
                                    <Col xs={6}>
                                        <div style={{ margin: "0.5em", textAlign: "center" }}>
                                            <img className="unselectable" src={item.album.images[1].url} />
                                            {String(item.duration_ms / 60000)[0]}:
                                            {Math.floor((item.duration_ms / 60000 - Math.floor(item.duration_ms / 60000)) * 60) >= 10
                                                ? Math.floor((item.duration_ms / 60000 - Math.floor(item.duration_ms / 60000)) * 60)
                                                : `0${Math.floor((item.duration_ms / 60000 - Math.floor(item.duration_ms / 60000)) * 60)}`}
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
    );
}

export default SearchBar;
