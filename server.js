// dotenv allows for system variables
// React has these already, this is for server only
require("dotenv").config();
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
var spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENTID;
var spotifyClientSecret = process.env.REACT_APP_SPOTIFY_CLIENTSECRET;
var SpotifyWebApi = require("spotify-web-api-node");
var spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: "http://localhost:3000/auth/callback",
});
// ======================================

// TODO: Implement "state" which is a security thing or something using a randomly generated string
app.get("/auth/login", (req, res) => {
    const scope = [
        "streaming",
        "user-read-private",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "user-top-read",
    ];
    var auth_query_parameters = new URLSearchParams({
        response_type: "code",
        client_id: process.env.REACT_APP_SPOTIFY_CLIENTID,
        scope: scope.join(" "),
        redirect_uri: "http://localhost:3000/auth/callback",
    });
    const redirectUri = "https://accounts.spotify.com/authorize/?" + auth_query_parameters.toString();
    res.send(
        JSON.stringify(
            {
                redirectUri,
            },
            null,
            2
        )
    );
});
// Mostly taken from https://github.com/thelinmichael/spotify-web-api-node#authorization
// Look here too: https://glitch.com/edit/#!/spotify-audio-analysis?path=public%2Findex.js%3A41%3A2
app.get("/auth/callback", (req, res) => {
    var code = req.query.code;
    console.log(req.query);
    spotifyApi.authorizationCodeGrant(code).then(
        (data) => {
            var accessToken = data.body.access_token;
            var expiresIn = data.body.expires_in;
            // expiresIn is in seconds
            var refreshToken = data.body.refresh_token;
            res.send({
                accessToken: accessToken,
                expiresIn: expiresIn,
                refreshToken: refreshToken,
            });
        },
        function (err) {
            console.log("Something went wrong!", err);
        }
    );
});

// just to test the api stuff
app.get("/top", (req, res) => {
	// new spotify web api instance for each call
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(req.query.accessToken);
    loggedInSpotifyApi.getMyTopTracks().then(
        (data) => {
            res.send(data.body);
        },
        (err) => {
            console.error(err);
        }
    );
});

// function refreshAccessToken() {
//     // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
//     spotifyApi.refreshAccessToken().then(
//         function (data) {
//             console.log("The access token has been refreshed!");

//             // Save the access token so that it's used in future calls
//             spotifyApi.setAccessToken(data.body["access_token"]);
//         },
//         function (err) {
//             console.log("Could not refresh access token", err);
//         }
//     );
// }

const port = process.env.PORT || 6567;
server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

// ============== Helper Functions =================
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
            rooms[socket.room].clients[socket.id].nickname = rooms[socket.room].clients[socket.id].nickname + " (dc'd)";
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
        rooms[info.roomId].clients[socket.id] = new Client(info.nickname, info.roomId);
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
