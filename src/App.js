import React from "react";
import io from "socket.io-client";
import Client from "./client";

import HomePage from "./Home.jsx";

import "./styles.css";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.client = new Client({
            match: props.match,
        });
        console.log(this.client);
        this.client.socket.on("newClient", (socket) => {});
    }

    render() {
        return (
            <div>
                <button
                    onClick={() => {
                        fetch("/auth/login")
                            .then((e) => e.json())
                            .then((data) => {
                                window.location = data.redirectUri;
                            })
                            .catch((error) => {
                                alert("Failed to prepare for Spotify Authentication");
                            });
                    }}
                >
                    CLICK ME
                </button>
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
document.addEventListener('DOMContentLoaded', () => {
	if (window.location.pathname == "/auth/callback") {
		fetch("/auth/callback"+window.location.search)
	}
})
export default App;
