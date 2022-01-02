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
                        <Col>
                            <Row style={{ width: "100%" }}>
                                <Col xs={5} style={{margin: "0.25em auto"}}>
                                    {/* TODO: fix time calculation */}
                                    <div>
                                        <img className="unselectable" src={song.album.images[2].url} />
                                    </div>
                                    <div style={{ textAlign: "center" }}>
                                        {String(song.duration_ms / 60000)[0]}:
                                        {Math.floor((song.duration_ms / 60000 - Math.floor(song.duration_ms / 60000)) * 60) >= 10
                                            ? Math.floor((song.duration_ms / 60000 - Math.floor(song.duration_ms / 60000)) * 60)
                                            : `0${Math.floor((song.duration_ms / 60000 - Math.floor(song.duration_ms / 60000)) * 60)}`}
                                    </div>
                                </Col>
                                <Col xs={7}>
                                    <div className="song-card-name">{song.name}</div>
                                    <div className="song-card-artist">{song.artists.map((artist) => artist.name).join(", ")}</div>
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
