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

// When using localhost:3000
var redirectUri = process.env.REACT_APP_REDIRECT_URI_LOCAL;

// When using public ip
// var redirectUri = process.env.REACT_APP_REDIRECT_URI;

var SpotifyWebApi = require("spotify-web-api-node");
const { RandomId } = require("./server/helperFunctions");
var spotifyApi = new SpotifyWebApi({
    clientId: spotifyClientId,
    clientSecret: spotifyClientSecret,
    redirectUri: redirectUri,
});
// ======================================

const rooms = {};

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
        redirect_uri: redirectUri,
    });
    const redirectUriAuth = "https://accounts.spotify.com/authorize/?" + auth_query_parameters.toString();
    res.send(
        JSON.stringify(
            {
                redirectUri: redirectUriAuth,
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
            res.send(err);
            console.error(err);
        }
    );
    // loggedInSpotifyApi.play({uris: ["spotify:track:0vWg2qGAdSGGsgmyVgb4ox"]})
});

app.get("/createLobby", (req, res) => {
    // TODO: Check if the access token is valid
    var roomId = RandomId();
    rooms[roomId] = {
        clients: {},
    };
    res.send({ roomId: roomId });
    console.log(`Room ${roomId} created`);
});
app.get("/joinLobby", (req, res) => {
    // TODO: Check if the access token is valid
    console.log(req.query);
    var roomId = req.query.roomId.trim();
    var loggedInSpotifyApi = new SpotifyWebApi();
    var client = new Client(roomId);
    loggedInSpotifyApi.setAccessToken(req.query.accessToken);
    loggedInSpotifyApi
        .getMe()
        .then((data) => {
            client.name = data.body.display_name;
            client.id = data.body.id;
            client.country = data.body.country;
            client.picture = data.body.images[0].url;
        })
        .then(() => {
            rooms[roomId].clients[req.query.socketid] = client;
        })
        .then(() => {
            res.sendStatus(200);
        });
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

// Add new client like rooms[roomId].clients[socket.id] = new Client()
function Client(roomId) {
    this.isHost = numberOfClientsInRoom(roomId) === 0;
}
setInterval(() => {
    console.dir(rooms, { depth: null });
}, 5000);
function numberOfClientsInRoom(roomId) {
    return Object.keys(rooms[roomId].clients).length;
}
