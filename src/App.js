import React from "react";
import io from "socket.io-client";
import Client from "./client";

import HomePage from "./Home.jsx";

import "./styles.css";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            songs: <div></div>,
        };
        this.client = new Client({
            match: props.match,
        });
        this.client.socket.on("newClient", (socket) => {});
    }

    render() {
        return (
            <div>
                <button
                    onClick={() => {
                        if (
                            localStorage.getItem("spotify-access-token") &&
                            localStorage.getItem("spotify-access-token-expiry") > Date.now()
                        ) {
                            fetch(`/top?accessToken=${localStorage.getItem("spotify-access-token")}`)
                                .then((e) => e.json())
                                .then((data) => {
                                    console.log(data);
                                    this.setState({
                                        songs: (
                                            <div>
                                                {data.items.map((e) => 
                                                    <div>{e.name}</div>
                                                )}
                                            </div>
                                        ),
                                    });
                                });
                        } else {
                            fetch("/auth/login")
                                .then((e) => e.json())
                                .then((data) => {
                                    window.location = data.redirectUri;
                                })
                                .catch((error) => {
                                    alert("Failed to prepare for Spotify Authentication");
                                });
                        }
                    }}
                >
                    CLICK ME
                </button>
                <div>{this.state.songs}</div>
                {/* <Switch>
          <Route path="/:roomId?" exact render={(props) => (<Home client={this.client} match={props.match} />)} />
          <Route path="/:roomId/lobby" exact render={(props) => (<Lobby client={this.client} match={props.match} />)} />
          <Route path="/:roomId/drawing" exact render={(props) => (<DrawingPhase client={this.client} match={props.match} />)} />
          <Route path="/:roomId/describing" exact render={(props) => (<DescribingPhase client={this.client} match={props.match} />)} />
          <Route path="/:roomId/round_results" exact render={(props) => (<RoundResultsPhase client={this.client} match={props.match} />)} />
          <Route path="/:roomId/game_results" exact render={(props) => (<GameResultsPhase client={this.client} match={props.match} />)} />
        </Switch> */}
                <HomePage />
            </div>
        );
    }
}
document.addEventListener("DOMContentLoaded", () => {
    if (
        localStorage.getItem("spotify-access-token") &&
        localStorage.getItem("spotify-access-token-expiry") > Date.now()
    ) {
    }
    if (window.location.pathname == "/auth/callback") {
        fetch("/auth/callback" + window.location.search)
            .then((e) => e.json())
            .then((data) => {
                localStorage.setItem("spotify-access-token", data.accessToken);
                localStorage.setItem("spotify-access-token-expiry", Date.now() + data.expiresIn * 990);
                localStorage.setItem("spotify-refresh-token", data.refreshToken);
                window.location = "/";
            });
    }
});
export default App;
