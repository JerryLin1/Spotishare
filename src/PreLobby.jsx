import { useNavigate, useParams } from "react-router-dom";

function PreLobby(props) {
    let { roomId } = useParams();
    let navigate = useNavigate();
    return (
        <div>
            <div>Press join to listen to moosic with friends! :D</div>
            <button onClick={() => {
                fetch(`/attemptJoinLobby?roomId=${roomId}`)
                .then(e => e)
                .then(data => {
                    if (data.status == 200) {
                        navigate(`/${roomId}/lobby`)
                    }
                })
            }}>JOIN THE LOBBY</button>
        </div>
    );
}
export default PreLobby;
