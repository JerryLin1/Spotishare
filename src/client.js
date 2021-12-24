import React from "react";
import io from "socket.io-client";

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
      roomId: roomId
    });
  };
}
