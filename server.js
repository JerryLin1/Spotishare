// ============== Magic =================
const { info } = require("console");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// ======================================

// ============= Spotify ================
var SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_SPOTIFY_CLIENTID,
  clientSecret: process.env.REACT_APP_SPOTIFY_CLIENTSECRET,
  redirectUri: "http://www.example.com/callback",
});
// ======================================

const port = process.env.PORT || 6567;
server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// ============== Helper Functions =================
function randomId(length) {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, length);
}

function numberOfClientsInRoom(roomId) {
  return Object.keys(rooms[roomId].clients).length;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
// =================================================

const rooms = {};

io.on("connection", (socket) => {
  console.log(`${socket.id} has connected.`);
  socket.room = undefined;
  socket.nickname = `Player # ${socket.id.substring(0, 4).toUpperCase()}`;

  console.log(`${socket.id} has connected.`);
  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected.`);
    if (socket.room in rooms) {
      rooms[socket.room].clients[socket.id].nickname =
        rooms[socket.room].clients[socket.id].nickname + " (dc'd)";
      rooms[socket.room].clients[socket.id].disconnected = true;
      rooms[socket.room].disconnected++;
    }
  });

  socket.on("createRoom", () => {
    let roomId = randomId(8);
    socket.emit("redirect", roomId + "/lobby");
    rooms[roomId] = new Room();

    console.log("room created " + roomId);
    console.dir(rooms, { depth: null });
  });

  socket.on("joinRoom", (info) => {
    socket.join(info.roomId);
    socket.room = info.roomId;
    rooms[info.roomId].clients[socket.id] = new Client(
      info.nickname,
      info.roomId,
    );
    io.to(info.roomId).emit("updateClientList", rooms[info.roomId].clients);
    console.log(rooms[info.roomId].clients);
  });
});

// Make new room like rooms[roomId] = new Room();
function Room() {
  this.clients = {};
}

// Add new client like rooms[roomId].clients[socket.id] = new Client()
function Client(nickname, roomId) {
  this.nickname = nickname;
  this.isHost = numberOfClientsInRoom(roomId) === 0;
}
