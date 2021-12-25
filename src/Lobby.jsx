import { useState } from "react";
import { useParams } from "react-router-dom";
import Client from "./client.js";

function Lobby(props) {
    let { roomId } = useParams();
    const [client] = useState(new Client());

    // async function is modified from https://stackoverflow.com/a/56216283
    (async () => {
        while (client.socket.id === undefined) await new Promise((resolve) => setTimeout(resolve, 1000));
        fetch(`/joinLobby?roomId=${roomId}&accessToken=${localStorage.getItem("spotify-access-token")}&socketid=${client.socket.id}`)
            .then((e) => e)
            .then((data) => {
                if (data.status == 200) {
                }
            });
    })();

    return (
        <div>
            <div>u r in da lobby {roomId}</div>
        </div>
    );
}
export default Lobby;
