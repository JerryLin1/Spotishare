import React, { useState, useEffect, useContext } from "react";
import { PlayCircle, PauseCircle, SkipForwardCircle, SkipBackwardCircle, VolumeUpFill, VolumeMuteFill } from "react-bootstrap-icons";

import { ClientContext } from "./contexts/ClientProvider";

import "./css/Lobby.css";

const SYNC_TOLERANCE = 3000;

function WebPlayback(props) {
    const client = useContext(ClientContext);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [volume, setVolume] = useState([0.5, undefined]);
    const [endOfQueue, setEndOfQueue] = useState(false);
    const [current_track, setTrack] = useState(undefined);

    useEffect(() => {
        // Create new spotify player instance
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            // Create tangible web player with the client's access token (requires Spotify premium)
            const player = new window.Spotify.Player({
                name: "spomongus",
                getOAuthToken: (unlockPlayer) => {
                    unlockPlayer(props.token);
                },
                volume: 0.5,
            });
            setPlayer(player);

            // Start playback on current device when the web player is ready
            player.addListener("ready", ({ device_id }) => {
                console.log("Ready with Device ID", device_id);
                setActive(true);
                client.socket.emit("initializeClientDevice", device_id);
            });

            player.addListener("not_ready", ({ device_id }) => {
                console.log("Device ID has gone offline", device_id);
            });

            let prevPlayerState = undefined;
            player.addListener("player_state_changed", (state) => {
                if (!state) return;
                if (prevPlayerState === undefined) {
                    prevPlayerState = state;
                    client.socket.emit("changeTrackRequest", {
                        trackId: state.track_window.current_track.id,
                        track: state.track_window.current_track,
                        state: state,
                    });
                    return;
                } else {
                    let ptrack = prevPlayerState.track_window.current_track.id;
                    let strack = state.track_window.current_track.id;
                    let ppos = prevPlayerState.position;
                    let spos = state.position;
                    if (ptrack !== strack) {
                        client.socket.emit("changeTrackRequest", {
                            trackId: state.track_window.current_track.id,
                            track: state.track_window.current_track,
                            state: state,
                        });
                    }
                    if (Math.abs(spos - ppos) >= SYNC_TOLERANCE) {
                        console.log("previous pos:", ppos, "current pos:", spos);
                        client.socket.emit("syncLobbyPosition", spos);
                    }
                }

                // Update current track playback state
                setTrack(state.track_window.current_track);
                setPaused(state.paused);
                player.getCurrentState().then((state) => (!state ? setActive(false) : setActive(true)));

                prevPlayerState = state;
            });

            player.connect();

            // Listen and enact playback changes
            client.socket.on("paused", (isPaused) => {
                isPaused ? player.pause() : player.resume();
            });

            client.socket.on("changeTrack", (trackId) => {
                setEndOfQueue(false);
                client.socket.emit("changeTrack", {
                    accessToken: localStorage.getItem("spotify-access-token"),
                    trackId: trackId,
                });
            });

            client.socket.on("updatePlaybackPos", (spos) => {
                player.seek(spos);
            });

            client.socket.on("endOfQueue", () => {
                // TODO: Prompt the lobby to add more tracks
                console.log("fired end");
                setEndOfQueue(true);
            });
        };
    }, []);

    if (!is_active) {
        return (
            <>
                <div className="web-player">
                    <h4> Loading player... </h4>
                </div>
            </>
        );
    } else if (current_track === undefined) {
        return (
            <>
                <div className="web-player">
                    <h1> Player is ready! Add songs to the queue to start the listening session. </h1>
                </div>
            </>
        );
    } else if (endOfQueue) {
        return (
            <>
                <div className="web-player">
                    <h1>You've reached the end of the queue. Add more songs keep the listening session going!</h1>
                </div>
            </>
        );
    } else {
        return (
            <div className="web-player">
                <img
                    src={current_track.album.images[0].url}
                    id="nowPlayingCover"
                    className="unselectable"
                    alt={current_track.name}
                    onClick={() => {window.open(`https://open.spotify.com/track/${current_track.id}`)}}
                />
                <div id="nowPlayingName">{current_track.name}</div>
                <div id="nowPlayingArtist">{current_track.artists.map((artist) => artist.name).join(", ")}</div>

                {client.isHost && (
                    <div id="nowPlayingSide">
                        <button
                            className="spotify-btn"
                            onClick={() => {
                                player.previousTrack();
                            }}
                        >
                            <SkipBackwardCircle />
                        </button>

                        <button
                            className="spotify-btn"
                            onClick={() => {
                                player.togglePlay();
                                client.socket.emit("togglePlayPause");
                            }}
                        >
                            {is_paused ? <PlayCircle /> : <PauseCircle />}
                        </button>

                        <button
                            className="spotify-btn"
                            onClick={() => {
                                player.nextTrack();
                            }}
                        >
                            <SkipForwardCircle />
                        </button>
                    </div>
                )}
                <div className="volume-control">
                    <span id="volume-icon">
                        {volume[0] === 0 ? (
                            <VolumeMuteFill
                                // When the volume button is clicked and sound is muted, it will change sound back to original sound before it was muted
                                // If the last event before it was muted was a drag or click to 0, sound will be put back to 0.5
                                onClick={() => {
                                    if (volume[1] !== undefined) {
                                        player.setVolume(Number(volume[1]));
                                        setVolume([volume[1], undefined]);
                                        document.querySelector("#volume-slider").style.setProperty("--scrollbar-width", `${volume[1] * 100}%`);
                                    } else {
                                        player.setVolume(0.5);
                                        setVolume([0.5, undefined]);
                                        document.querySelector("#volume-slider").style.setProperty("--scrollbar-width", `50%`);
                                    }
                                }}
                            />
                        ) : (
                            <VolumeUpFill
                                onClick={() => {
                                    document.querySelector("#volume-slider").style.setProperty("--scrollbar-width", `0%`);
                                    player.setVolume(0);
                                    setVolume([0, volume[0]]);
                                }}
                            />
                        )}
                    </span>
                    <input
                        id="volume-slider"
                        type="range"
                        min={0}
                        max={1.0}
                        value={volume[0]}
                        step={0.01}
                        onChange={(e) => {
                            let volume = Number(e.target.value);
                            player.setVolume(volume);
                            setVolume([volume, undefined]);
                            document.querySelector("#volume-slider").style.setProperty("--scrollbar-width", `${volume * 100}%`);
                        }}
                    ></input>
                </div>
            </div>
        );
    }
}

export default WebPlayback;
