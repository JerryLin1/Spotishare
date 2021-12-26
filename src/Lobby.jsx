import { useEffect, useState } from "react";
import { Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Client from "./client.js";

function Lobby(props) {
    let { roomId } = useParams();
    const [client, setClient] = useState(new Client());
    const [members, setMembers] = useState([]);

    const renderMembers = () => {
        let newMemberList = [];
        for (const user of members) {
            console.log(user)
            newMemberList.push(
                <div className="member-card">
                    <img src={user.image} height="80px" width="80px"></img>
                    {user.name}
                    {user.isHost && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={36}
                            height={20}
                            viewBox="0 0 512 512"
                            fill="gold"
                        >
                            <path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z" />
                        </svg>
                    )}
                </div>
            )
        }

        return newMemberList;
    };

    // async function is modified from https://stackoverflow.com/a/56216283
    const initializeUser = async () => {
        while (client.socket.id === undefined) await new Promise((resolve) => setTimeout(resolve, 1000));
        fetch(
            `/joinLobby?roomId=${roomId}&accessToken=${localStorage.getItem("spotify-access-token")}&socketid=${client.socket.id}`
        )
            .then((data) => {
                if (data.status == 200) {
                    client.socket.emit("joinRoom", {
                        roomId: roomId,
                    });
                    client.socket.on("updateClientList", (clients) => {
                        client.clientsInRoom = clients;
                        setMembers(Object.values(clients));
                    });
                }
            });
    }

    useEffect(() => {
        initializeUser();
    }, [])

    return (
        <div>
            <Col xs="5">
                <h3>Current Listening Party Members:</h3>
                <div>{renderMembers()}</div>
            </Col>
        </div>
    );
}
export default Lobby;
