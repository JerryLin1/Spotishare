import { Row, Col } from "react-bootstrap";
import "./css/Queue.css";

function Queue(props) {
    const queue = props.queue;
    if (queue.length === 0) {
        return (
            <div id="queue-container">
                <h2 id="queue-title">There's nothing in the queue!</h2>
                <h4 style={{ textAlign: "center" }}>Add some songs by searching them up on the right!</h4>
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
                        <Col xs={12} xl={9} style={{ padding: "0.5em", alignItems: "center" }}>
                            <img className="queue-img unselectable" src={song.album.images[1].url} />
                            <div className="queue-desc">
                                {song.name} by {song.artists.map((artist) => artist.name).join(", ")} // Added by {user}
                            </div>
                        </Col>
                        <Col
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
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
