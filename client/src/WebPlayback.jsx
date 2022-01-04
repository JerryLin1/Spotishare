import { set } from "animejs";
import React, { useState, useEffect, useContext } from "react";
import { PlayCircle, PauseCircle, SkipForwardCircle, SkipBackwardCircle, SegmentedNav } from "react-bootstrap-icons";
import { io } from "socket.io-client";
import { ClientContext } from "./contexts/ClientProvider";

import "./css/Lobby.css";

const syncTolerance = 3000;

function WebPlayback(props) {
    const client = useContext(ClientContext);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
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
                    if (Math.abs(spos - ppos) >= syncTolerance) {
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
                    <h2> Player is ready! Add songs to the queue to start the listening session. </h2>
                </div>
            </>
        );
    } else if (endOfQueue) {
        return (
            <>
                <div className="web-player">
                    <h2>You've reached the end of the queue. Add more songs keep the listening session going!</h2>
                </div>
            </>
        );
    } else {
        return (
            <>
                <div className="web-player">
                    <img src={current_track.album.images[0].url} id="nowPlayingCover" className="unselectable" alt="" />
                    <div id="nowPlayingName">{current_track.name}</div>
                    <div id="nowPlayingArtist">{current_track.artists.map((artist) => artist.name).join(", ")}</div>

                    {client.isHost && (
                        <div id="nowPlayingSide">
                            <button
                                className="spotifyBtn"
                                onClick={() => {
                                    player.previousTrack();
                                }}
                            >
                                <SkipBackwardCircle />
                            </button>

                            <button
                                className="spotifyBtn"
                                onClick={() => {
                                    player.togglePlay();
                                    client.socket.emit("togglePlayPause");
                                }}
                            >
                                {is_paused ? <PlayCircle /> : <PauseCircle />}
                            </button>

                            <button
                                className="spotifyBtn"
                                onClick={() => {
                                    player.nextTrack();
                                }}
                            >
                                <SkipForwardCircle />
                            </button>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

export default WebPlayback;
