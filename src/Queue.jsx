function Queue(props) {
    const queue = props.queue;

    return (
        <div id="queue">
            <div id="queue-container">
                <h2 id="queue-title" className="unselectable">
                    Next In Queue
                </h2>
                {queue.map((item, key) => {
                    return (
                        <div key={key} className="song-card">
                            <iframe
                                src={`https://open.spotify.com/embed/track/${item}?utm_source=generator`}
                                height="80"
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            ></iframe>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Queue;
