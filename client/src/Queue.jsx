import { Row, Col } from "react-bootstrap";
import "./css/Queue.css";

function Queue(props) {
    const queue = props.queue;
    if (queue.length === 0) {
        return (
            <div id="queue-container">
                <h2 id="queue-title">There's nothing in the queue!</h2>
                <h4 style={{ textAlign: "center" }}>Add some songs by searching some up!</h4>
            </div>
        );
    }
    return (
        <div id="queue-container">
            <h2 id="queue-title" className="unselectable">
                Next In Queue
            </h2>
            {queue.map((item, key) => {
                let song = item[0],
                    user = item[1];
                return (
                    <Row key={key} className="song-card">
                        <Col xs={12} xl={10}>
                            <Row style={{ width: "100%" }}>
                                <Col xs={5}>
                                    <img className="unselectable" src={song.album.images[2].url} />
                                    {/* TODO: fix time calculation */}
                                    <div style={{ textAlign: "center", margin: "0.5em auto" }}>
                                        {song.duration_ms / 60000 - Math.floor(song.duration_ms / 60000) < 0.6
                                            ? String(song.duration_ms / 60000)[0]
                                            : String(song.duration_ms / 60000 + 1)[0]}
                                        :{Math.round((song.duration_ms / 60000 - Math.floor(song.duration_ms / 60000)) * 60)}
                                    </div>
                                </Col>
                                <Col xs={7} className="queue-desc">
                                    <div style={{ marginBottom: "0.5em" }}>{song.name}</div>
                                    <div style={{ fontSize: "0.8em" }}>{song.artists.map((artist) => artist.name).join(", ")}</div>
                                </Col>
                            </Row>
                        </Col>
                        <Col
                            xl={12}
                            xs={12}
                            style={{
                                padding: "0 0.5em",
                            }}
                        >
                            <button>Remove</button>
                        </Col>
                    </Row>
                );
            })}
        </div>
    );
}

export default Queue;
