import { useSignal } from "@preact/signals";
import { useRoute } from "preact-iso";
import { Rice } from "../lib/models";
import { RiceInfo } from "../components/RiceInfo";
import { useEffect } from "preact/hooks";
import { API_URL } from "../lib/consts";
import { Placeholder } from "../components/Placeholder";

export default function RicePage() {
    const route = useRoute();
    const { username, slug } = route.params;

    const riceInfo = useSignal<Rice>();

    useEffect(() => {
        fetch(`${API_URL}/users/${username}/rices/${slug}`)
            .then((res) => res.json())
            .then((res) => (riceInfo.value = res));
    }, [username, slug]);

    return (
        <div className="rice-page mx-auto my-8 flex flex-col gap-6">
            {riceInfo.value !== undefined ? <RiceInfo {...riceInfo.value} /> : <Placeholders />}
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
