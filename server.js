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
        "ugc-image-upload",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "user-read-private",
        "user-read-email",
        "user-follow-modify",
        "user-follow-read",
        "user-library-modify",
        "user-library-read",
        "streaming",
        "app-remote-control",
        "user-read-playback-position",
        "user-top-read",
        "user-read-recently-played",
        "playlist-modify-private",
        "playlist-read-collaborative",
        "playlist-read-private",
        "playlist-modify-public",
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
        paused: false,
        chatHistory: [],
    };
    res.send({ roomId: roomId });
    console.log(`Room ${roomId} created`);
});
app.get("/joinLobby", (req, res) => {
    // TODO: Check if the access token is valid
    var roomId = req.query.roomId.trim();
    var loggedInSpotifyApi = new SpotifyWebApi();
    var client = new Client(roomId);
    // TODO: Check if a user with this accesstoken is already in this room
    rooms[roomId].clients[req.query.socketid] = {};
    loggedInSpotifyApi.setAccessToken(req.query.accessToken);
    loggedInSpotifyApi
        .getMe()
        .then((data) => {
            client.name = data.body.display_name;
            client.id = data.body.id;
            client.country = data.body.country;
            client.image = data.body.images[0].url;
        })
        .then(() => {
            rooms[roomId].clients[req.query.socketid] = client
        })
        .then(() => {
            res.sendStatus(200);
        })
        .catch((error) => console.log(error))
});

app.get("/playerReady", (req, res) => {
    // TODO: Check if the access token is valid
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(req.query.accessToken);
    loggedInSpotifyApi.transferMyPlayback([req.query.deviceId], { play: true });

});

// TODO: Refresh access token? IDK what this is
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
    // console.log(`${socket.id} has connected.`);
    socket.room = undefined;

    socket.on("disconnect", () => {
        // console.log(`${socket.id} has disconnected.`);
        if (socket.room in rooms) {
            sendToChat({
                msg: `${rooms[socket.room].clients[socket.id].name} left the lobby.`,
                type: "SERVER",
                roomId: socket.room
            })
            delete rooms[socket.room].clients[socket.id];
            io.to(socket.room).emit("updateClientList", rooms[socket.room].clients);
        }
    });

    socket.on("joinRoom", (info, callback) => {
        socket.join(info.roomId);
        socket.room = info.roomId;
        io.to(info.roomId).emit("updateClientList", rooms[info.roomId].clients);
        sendToChat({
            msg: `${rooms[socket.room].clients[socket.id].name} joined the lobby.`,
            type: "SERVER",
            roomId: socket.room
        })
        callback({
            isHost: rooms[socket.room].clients[socket.id].isHost
        })
    });

    socket.on("togglePlayPause", () => {
        rooms[socket.room].paused = !rooms[socket.room].paused;
        io.to(socket.room).emit("paused", rooms[socket.room].paused);
        console.log(rooms[socket.room].paused)
    });

    socket.on("sendMessage", (msg) => {
        sendToChat({
            msg,
            type: "USER",
            userName: rooms[socket.room].clients[socket.id].name,
            userId: socket.id,
            roomId: socket.room
        });
    })
    function sendToChat({ msg, type, userName, userId, roomId }) {
        let chatMsg = { msg, type, userName, userId };
        rooms[roomId].chatHistory.push(chatMsg);
        io.to(roomId).emit("receiveMessage", chatMsg);
    }
    socket.on("changeTrackRequest", ({ trackId, track, state }) => {
        console.log(trackId)
        sendToChat({
            msg: `Now playing <strong>${track.name}</strong> by <strong>${track.artists.map(artist => artist.name).join(", ")}</strong>`,
            type: "SERVER",
            roomId: socket.room
        });
        socket.broadcast.to(socket.room).emit("changeTrack", { trackId })
    })
    socket.on("changeTrack", ({ trackId, accessToken }) => {
        var loggedInSpotifyApi = new SpotifyWebApi();
        loggedInSpotifyApi.setAccessToken(accessToken);
        loggedInSpotifyApi.play({ uris: [`spotify:track:${trackId}`] })
    })
});



// Add new client like rooms[roomId].clients[socket.id] = new Client()
function Client(roomId) {
    this.isHost = numberOfClientsInRoom(roomId) === 0;
}
// setInterval(() => {
//     console.dir(rooms, { depth: null });
// }, 5000);
function numberOfClientsInRoom(roomId) {
    return Object.keys(rooms[roomId].clients).length;
}
