// dotenv allows for system variables
// React has these already, this is for server only
require("dotenv").config();
// ============== Magic =================
const { info } = require("console");
const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
// ======================================

// ============= Spotify ================
var spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENTID;
var spotifyClientSecret = process.env.REACT_APP_SPOTIFY_CLIENTSECRET;

var redirectUri = process.env.REACT_APP_REDIRECT_URI_LOCAL;

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
    console.log("TRYING TO LOG IN");
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
app.get("/auth/aftercallback", (req, res) => {
    var code = req.query.code;
    spotifyApi.authorizationCodeGrant(code).then(
        (data) => {
            returnAuth(req, res, data);
        },
        function (err) {
            console.log("Something went wrong!", err);
        }
    );
});

function returnAuth(req, res, data) {
    var accessToken = data.body.access_token;
    var expiresIn = data.body.expires_in;
    // expiresIn is in seconds
    var refreshToken = data.body.refresh_token;
    let loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.getMe().then((clientData) => {
        res.send(
            JSON.stringify({
                accessToken: accessToken,
                expiresIn: expiresIn,
                refreshToken: refreshToken,
                clientData: clientData,
            })
        );
    });
}

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
        currentTrack: undefined,
        currentTrackStart: Date.now(),
        queue: [],
        currentQueuePos: 0
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

    // Initialize a new collaborative playlist for the lobby

    if (client.isHost) rooms[roomId].hostToken = req.query.accessToken;

    loggedInSpotifyApi
        .getMe()
        .then((data) => {
            client.name = data.body.display_name;
            client.id = data.body.id;
            client.country = data.body.country;
            client.image = data.body.images[0].url;
        })
        .then(() => {
            rooms[roomId].clients[req.query.socketid] = client;
        })
        .then(() => {
            res.sendStatus(200);
        })
        .catch((error) => console.log(error));
});

app.get("/playerReady", (req, res) => {
    // TODO: Check if the access token is valid
    let accessToken = req.query.accessToken;
    let roomId = req.query.roomId;
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(accessToken);
    loggedInSpotifyApi.transferMyPlayback([req.query.deviceId], { play: false }).then(() => {
        if (rooms[req.query.roomId].currentTrack != undefined)
            changeTrack(rooms[roomId].currentTrack, accessToken, rooms[roomId].currentTrackStart);
    });
});

app.get("/search", (req, res) => {
    var loggedInSpotifyApi = new SpotifyWebApi();
    loggedInSpotifyApi.setAccessToken(req.query.accessToken);
    console.log(`Searching "${req.query.value}"`);
    loggedInSpotifyApi.searchTracks(req.query.value, { limit: 10 }).then((data) => {
        res.send(data.body.tracks.items);
    });
});

app.get("/refreshAccessToken", (req, res) => {
    attemptRefreshToken(req, res);
});

function attemptRefreshToken(req, res) {
    spotifyApi.setRefreshToken(req.query.refreshToken);
    spotifyApi.refreshAccessToken().then((data) => {
        returnAuth(req, res, data);
    });
}

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

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
                roomId: socket.room,
            });
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
            roomId: socket.room,
        });
        callback({
            isHost: rooms[socket.room].clients[socket.id].isHost,
        });
    });

    socket.on("playWhenReady", ({ device_id, accessToken }, callback) => {
        if (rooms[socket.room].queue.length > 0) {
            var loggedInSpotifyApi = new SpotifyWebApi();
            loggedInSpotifyApi.setAccessToken(accessToken);
            let currentPos = rooms[socket.room].currentQueuePos
            loggedInSpotifyApi
                .play({ device_id: device_id, uris: [rooms[socket.room].queue[currentPos].uri] })
                .then((data) => {
                    rooms[socket.room].currentTrack = rooms[socket.room].queue[currentPos].id;
                    rooms[socket.room].currentTrackStart = Date.now();
                    waitForTrackEnd();
                });
        }
        callback({
            playing: rooms[socket.room].queue.length > 0,
        });
    });

    socket.on("togglePlayPause", () => {
        rooms[socket.room].paused = !rooms[socket.room].paused;
        io.to(socket.room).emit("paused", rooms[socket.room].paused);
    });

    socket.on("sendMessage", (msg) => {
        sendToChat({
            msg,
            type: "USER",
            userName: rooms[socket.room].clients[socket.id].name,
            userId: socket.id,
            roomId: socket.room,
        });
    });

    function sendToChat({ msg, type, userName, userId, roomId }) {
        let chatMsg = { msg, type, userName, userId };
        rooms[roomId].chatHistory.push(chatMsg);
        io.to(roomId).emit("receiveMessage", chatMsg);
    }

    socket.on("changeTrackRequest", ({ trackId, track, state }) => {
        console.log(`Now playing ${track.name}`);
        sendToChat({
            msg: `Now playing <strong>${track.name}</strong> by <strong>${track.artists
                .map((artist) => artist.name)
                .join(", ")}</strong>`,
            type: "SERVER",
            roomId: socket.room,
        });
        rooms[socket.room].currentTrack = trackId;
        rooms[socket.room].currentTrackStart = Date.now();
        socket.broadcast.to(socket.room).emit("changeTrack", trackId);
    });

    socket.on("changeTrack", ({ trackId, accessToken }) => {
        var loggedInSpotifyApi = new SpotifyWebApi();
        loggedInSpotifyApi.setAccessToken(accessToken);
        loggedInSpotifyApi.play({
            uris: [`spotify:track:${trackId}`],
        }).then((data) => {
            waitForTrackEnd();
        });
    });

    // Creates a ref to check every second whether the current track has ended
    // If so, events are fired to handle what to do next
    function waitForTrackEnd() {
        let checkIfFinished = setInterval(() => {
            const currentTrackInfo = rooms[socket.room].queue[rooms[socket.room].currentQueuePos];
            var loggedInSpotifyApi = new SpotifyWebApi();
            loggedInSpotifyApi.setAccessToken(rooms[socket.room].hostToken);

            loggedInSpotifyApi.getMyCurrentPlaybackState()
                .then((data) => {
                    if (data.body.is_playing && data.body.progress_ms + 1000 >= currentTrackInfo.duration_ms) {
                        console.log("Track in queue has ended; firing changeTrack");
                        rooms[socket.room].currentQueuePos++;
                        if (rooms[socket.room].currentQueuePos < rooms[socket.room].queue.length) {
                            console.log("Change track firing...")
                            io.to(socket.room).emit("changeTrack", rooms[socket.room].queue[rooms[socket.room].currentQueuePos].id);
                        } else {
                            io.to(socket.room).emit("endOfQueue");
                        }
                        clearInterval(checkIfFinished);
                    }
                })
        }, 1000)
    }

    socket.on("syncLobbyPosition", (spos) => {
        socket.broadcast.to(socket.room).emit("updatePlaybackPos", spos);
    });

    socket.on("addToQueue", ({ track, trackId, accessToken }) => {
        rooms[socket.room].queue.push(track);
        console.log(rooms[socket.room].queue.length);
        // var loggedInSpotifyApi = new SpotifyWebApi();
        // loggedInSpotifyApi.setAccessToken(accessToken);
        // loggedInSpotifyApi
        //     .addTracksToPlaylist(rooms[socket.room].playlist.id, [trackId])
        //     .then((data) => {
        //         // Update the room's playlist
        //         loggedInSpotifyApi.getPlaylist(rooms[socket.room].playlist.id).then((data) => {
        //             rooms[socket.room].playlist = data.body;
        //         });
        //     })
        //     .catch((err) => console.log(err));
    });
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
