// TODO: creating something similar for authorized users

import { useContext, useEffect } from "preact/hooks";
import { AppState } from "../lib/appState";
import { Route, useLocation } from "preact-iso";

export default function AdminRoute(props: any) {
    const { route } = useLocation();
    const { user, userLoading } = useContext(AppState);

    useEffect(() => {
        if (userLoading.value) {
            return;
        }

        const isAdmin = user.value?.isAdmin ?? false;
        if (!isAdmin) {
            route("/", true);
        }
    }, [userLoading.value]);

    // I know this is an awful (imo) way of doing this
    // I need to rewrite authorization code (especially access token refreshing) tho make it better
    return userLoading.value ? (
        <p>Checking if you have access to this resource...</p>
    ) : user.value.isAdmin ? (
        <Route {...props} />
    ) : null;
}
