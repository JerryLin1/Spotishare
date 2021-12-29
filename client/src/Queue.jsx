import { Row, Col } from "react-bootstrap";

function Queue(props) {
    const queue = props.queue;

    return (
        <div id="queue-container">
            <h2 id="queue-title" className="unselectable">
                Next In Queue
            </h2>
            {queue.map((item, key) => {
                return (
                    <Row key={key} className="song-card">
                        <Col xs={12} xl={10} style={{ padding: "0 0.5em", alignItems: "center" }}>
                            <iframe
                                src={`https://open.spotify.com/embed/track/${item}?utm_source=generator`}
                                width="100%"
                                height="80"
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            ></iframe>
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