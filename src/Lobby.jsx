import { useParams } from "react-router-dom";

function Lobby(props) {
    let { roomId } = useParams();
    return (
        <div>
            <div>u r in da lobby {roomId}</div>
        </div>
    );
}
export default Lobby;
