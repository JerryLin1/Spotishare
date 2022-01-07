import { Row, Col } from "react-bootstrap";
import { ClientContext } from "./contexts/ClientProvider.jsx";
import { useContext } from "react";

import "./css/Queue.css";

function Queue(props) {
    const queue = props.queue;
    const client = useContext(ClientContext);
    if (queue.length === 0) {
        return (
            <div id="queue-container">
                <h2 id="queue-title">There's nothing in the queue!</h2>
                <h6 style={{ textAlign: "center" }}>Add some songs by searching some up!</h6>
            </div>
        );
    }
    return (
        <div id="queue-container">
            <h2 id="queue-title" className="unselectable">
                Song Queue
            </h2>
            {queue.map((queueItem, key) => {
                let track = queueItem.track,
                    user = queueItem.user;
                return (
                    <Row key={key} className="song-card">
                        <Col>
                            <Row style={{ width: "100%" }}>
                                <Col xs={5} style={{ margin: "0.25em auto" }}>
                                    <div>
                                        <img className="unselectable" src={track.album.images[1].url} />
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        {String(track.duration_ms / 60000)[0]}:
                                        {Math.floor((track.duration_ms / 60000 - Math.floor(track.duration_ms / 60000)) * 60) >= 10
                                            ? Math.floor((track.duration_ms / 60000 - Math.floor(track.duration_ms / 60000)) * 60)
                                            : `0${Math.floor((track.duration_ms / 60000 - Math.floor(track.duration_ms / 60000)) * 60)}`}
                                    </div>
                                </Col>
                                <Col xs={7}>
                                    <div className="song-card-name">{track.name}</div>
                                    <div className="song-card-artist">{track.artists.map((artist) => artist.name).join(", ")}</div>
                                    <div className="added-by">Added by {user}</div>
                                </Col>
                            </Row>
                        </Col>
                        <Col xl={12} xs={12}>
                            <button
                                onClick={() => {
                                    client.socket.emit("removeFromQueue", { key: key });
                                }}
                            >
                                {client.isHost ? "Remove" : "Vote to remove"}
                            </button>
                        </Col>
                    </Row>
                );
            })}
        </div>
    );
}

export default Queue;
