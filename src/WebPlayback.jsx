import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const track = {
    name: "",
    album: {
        images: [{ url: "" }],
    },
    artists: [{ name: "" }],
};

function WebPlayback(props) {
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: "spomongus",
                getOAuthToken: (cb) => {
                    cb(props.token);
                },
                volume: 0.5,
            });

            setPlayer(player);

            var prevPlayerState = undefined;

            player.addListener("ready", ({ device_id }) => {
                console.log("Ready with Device ID", device_id);
                fetch(`/playerReady?accessToken=${localStorage.getItem("spotify-access-token")}&deviceId=${device_id}`);
            });

            player.addListener("not_ready", ({ device_id }) => {
                console.log("Device ID has gone offline", device_id);
            });

            player.addListener("player_state_changed", (state) => {
                if (prevPlayerState == undefined) prevPlayerState = state;
                else {
                    let ptrack = prevPlayerState.track_window.current_track.id;
                    let strack = state.track_window.current_track.id;
                    let ppos = prevPlayerState.position;
                    let spos = state.position;
                    if (ptrack != strack) {
                        props.client.socket.emit("changeTrackRequest", {
                            trackId: state.track_window.current_track.id,
                        });
                        console.log(state);
                    }
                }

                if (!state) {
                    return;
                }

                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then((state) => {
                    !state ? setActive(false) : setActive(true);
                });
                prevPlayerState = state;
            });

            player.connect();

            props.client.socket.on("paused", (isPaused) => {
                isPaused ? player.pause() : player.resume();
            });
            props.client.socket.on("changeTrack", ({ trackId }) => {
                props.client.socket.emit("changeTrack", {
                    accessToken: localStorage.getItem("spotify-access-token"),
                    trackId: trackId,
                });
            });
        };
    }, []);

    if (!is_active) {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Loading player... </b>
                    </div>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <img
                            height="500px"
                            width="500px"
                            src={current_track.album.images[0].url}
                            className="now-playing__cover"
                            alt=""
                        />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button
                                className="btn-spotify"
                                onClick={() => {
                                    player.previousTrack();
                                }}
                            >
                                &lt;&lt;
                            </button>

                            <button
                                className="btn-spotify"
                                onClick={() => {
                                    player.togglePlay();
                                    props.client.socket.emit("togglePlayPause", "po");
                                }}
                            >
                                {is_paused ? "PLAY" : "PAUSE"}
                            </button>

                            <button
                                className="btn-spotify"
                                onClick={() => {
                                    player.nextTrack();
                                }}
                            >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default WebPlayback;
