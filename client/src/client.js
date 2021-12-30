import React from "react";
import io from "socket.io-client";
import { isLoggedIn } from ".";

export default class Client extends React.Component {
    constructor(props) {
        super(props);
        this.socket = io();

        // Redirect URL when client joins/creates room
        this.socket.on("redirect", (id) => {
            this.roomId = id;
            this.pushURL(id);
        });

        this.socket.on("updateClientList", (clients) => {
            this.clientsInRoom = clients;
        });
        if (isLoggedIn()) refreshAccessToken();
        setInterval(() => {
            refreshAccessToken();
        }, 50000);
        function refreshAccessToken() {
            fetch(`/refreshAccessToken?refreshToken=${localStorage.getItem("spotify-refresh-token")}`)
                .then((e) => e.json())
                .then((data) => {
                    localStorage.setItem("spotify-access-token", data.accessToken);
                    localStorage.setItem("spotify-access-token-expiry", Date.now() + data.expiresIn * 990);
                });
        }
    }

    pushURL = (id) => {
        this.props.match.history.push("/" + id);
    };

    redirectURL = (id) => {
        this.props.match.history.replace("/" + id);
    };

    createRoom = () => {
        this.socket.emit("createRoom");
    };

    joinRoom = (roomId) => {
        this.roomId = roomId;
        this.socket.emit("joinRoom", {
            roomId: roomId,
        });
    };

    sendMessage = (msg) => {
        if (msg != "") {
            this.socket.emit("sendMessage", msg);
        }
    };
}
