import { useNavigate, useParams } from "react-router-dom";
import { isLoggedIn, login } from ".";

function PreLobby(props) {
    let { roomId } = useParams();
    let navigate = useNavigate();
    return (
        <div>
            <div>Press join to listen to moosic with friends! :D</div>
            <button
                onClick={() => {
                    if (isLoggedIn()) navigate(`/${roomId}/lobby`);
                    else
                        login();
                }}
            >
                JOIN THE LOBBY
            </button>
        </div>
    );
}
export default PreLobby;
