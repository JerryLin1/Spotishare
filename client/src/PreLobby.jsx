import { Container } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { isLoggedIn, login } from ".";

import "./css/Lobby.scss";

function PreLobby(props) {
    let { roomId } = useParams();
    let navigate = useNavigate();
    return (
        <Container fluid className="pre-lobby">
            <h1 className="page-title unselectable">SpotiShare</h1>
            <button
                onClick={() => {
                    if (!isLoggedIn()) login();
                    else {
                        /* Logout */
                    }
                }}
                id="sign-in"
            >
                {localStorage.getItem("client-data") ? `Hello ${JSON.parse(localStorage.getItem("client-data")).body.display_name}!` : "Sign In"}
            </button>
            
            <div className="pre-lobby-body">
                <div>
                    <h1>Press to join the listening party!</h1>
                </div>

                <div style={{ margin: "2em auto" }}>
                    <button
                        onClick={() => {
                            if (isLoggedIn()) navigate(`/${roomId}/lobby`);
                            else login();
                        }}
                    >
                        JOIN THE LOBBY
                    </button>
                </div>
                {/* idk if its possible to see how many are in the lobby before inside the lobby */}
                {/* <div>Lobby currently has {0} people</div> */}
                <div style={{ fontSize: "1.25em" }}>Room ID: {roomId}</div>
            </div>
        </Container>
    );
}
export default PreLobby;
