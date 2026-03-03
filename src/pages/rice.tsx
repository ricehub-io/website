import { apiFetch, ApiError } from "@/api/apiFetch";
import { Rice } from "@/api/legacy-schemas";
import { Placeholder } from "@/components/Placeholder";
import { RiceInfo } from "@/components/RiceInfo";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import NotFoundPage from "@/pages/_404";
import { useSignal } from "@preact/signals";
import { useRoute } from "preact-iso";
import { useContext, useEffect } from "preact/hooks";

export default function RicePage() {
    const route = useRoute();
    const { username, slug } = route.params;

    const { accessToken, userLoading } = useContext(AppState);

    const riceInfo = useSignal<Rice>(null);
    const notFound = useSignal(false);

    useEffect(() => {
        if (userLoading.value) {
            return;
        }

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
    }, [username, slug, accessToken.value, userLoading.value]);

    if (notFound.value) {
        return <NotFoundPage />;
    }

    return (
        <div className="mx-auto my-8 flex flex-col gap-6 md:w-[min(80%,1000px)]">
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
