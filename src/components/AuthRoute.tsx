import { Route, useLocation } from "preact-iso";
import { useContext, useEffect } from "preact/hooks";
import { AppState } from "../lib/appState";

export default function AuthRoute(props: any) {
    const { route } = useLocation();
    const { user, userLoading } = useContext(AppState);

    useEffect(() => {
        if (userLoading.value) {
            return;
        }

        // user not logged in
        if (user.value === null) {
            route("/", true);
        }
    }, [userLoading.value]);

    return userLoading.value ? (
        <p>Loading user data...</p>
    ) : user.value !== null ? (
        <Route {...props} />
    ) : null;
}
