import { useSignal } from "@preact/signals";
import { useRoute } from "preact-iso";
import { Rice } from "../lib/models";
import { RiceInfo } from "../components/RiceInfo";
import { useEffect } from "preact/hooks";
import { ApiError, apiFetch } from "../lib/api";
import { Placeholder } from "../components/Placeholder";
import { accessToken, addNotification } from "../lib/appState";
import { HttpStatus } from "../lib/enums";
import NotFoundPage from "./_404";

export default function RicePage() {
    const route = useRoute();
    const { username, slug } = route.params;

    const riceInfo = useSignal<Rice>(null);
    const notFound = useSignal(false);

    useEffect(() => {
        apiFetch<Rice>("GET", `/users/${username}/rices/${slug}`)
            .then(([_, body]) => (riceInfo.value = body))
            .catch((e) => {
                if (e instanceof ApiError) {
                    if (e.statusCode === HttpStatus.NotFound) {
                        notFound.value = true;
                    } else {
                        addNotification(
                            "Failed to fetch data",
                            e.message,
                            "error"
                        );
                    }
                }
            });
    }, [username, slug, accessToken.value]);

    if (notFound.value) {
        return <NotFoundPage />;
    }

    return (
        <div className="rice-page mx-auto my-8 flex flex-col gap-6">
            {riceInfo.value !== null ? (
                <RiceInfo {...riceInfo.value} />
            ) : (
                <Placeholders />
            )}
        </div>
    );
}

function Placeholders() {
    return (
        <>
            <Placeholder className="h-9" />
            <Placeholder className="h-60" />
            <Placeholder className="h-12" />
            <div className="grid grid-cols-2 gap-2">
                <Placeholder className="aspect-video w-full" />
                <Placeholder className="aspect-video w-full" />
                <Placeholder className="aspect-video w-full" />
                <Placeholder className="aspect-video w-full" />
            </div>
            <Placeholder className="h-18" />
        </>
    );
}
