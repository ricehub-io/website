import { useContext } from "preact/hooks";
import { AppState } from "../lib/appState";
import { useLocation } from "preact-iso";

export function AccountPage() {
    const { route } = useLocation();
    const { user } = useContext(AppState);

    if (user.value === null) {
        route("/", true);
        return;
    }

    const { username, displayName, avatarUrl, createdAt } = user.value;

    return (
        <div>
            <h1 className="font-bold text-3xl">account</h1>
            <p>{displayName}</p>
            <p>{username}</p>
            <img src={avatarUrl} alt="profile picture" />
            <p>created {createdAt}</p>
        </div>
    );
}
