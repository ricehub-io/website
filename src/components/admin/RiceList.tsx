import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { addNotification } from "@/lib/appState";
import { For } from "@preact/signals/utils";
import { apiFetchV2 } from "@/api/apiFetch";
import { FetchRicesSchema, PartialRice } from "@/api/schemas";
import Bullet from "@/components/Bullet";
import { formatLocaleDate } from "@/lib/math";

export default function RiceList() {
    const rices = useSignal<PartialRice[]>([]);

    useEffect(() => {
        console.log("fetch rices");
        apiFetchV2("GET", "/rices?sort=recent", FetchRicesSchema)
            .then(([_, data]) => (rices.value = data.rices))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch recent rices",
                        e.message,
                        "error"
                    );
                }
            });
    }, []);

    return (
        // we can assume that the website has AT LEAST one rice
        // added so no need to add fallback here
        <For each={rices}>
            {(rice, _) => <RiceInfo key={rice.id} {...rice} />}
        </For>
    );
}

function RiceInfo({
    title,
    username,
    slug,
    createdAt,
    thumbnail,
    stars,
    downloads,
}: PartialRice) {
    const ricePath = `/${username}/${slug}`;

    return (
        <div className="bg-background-2 rounded-md p-4">
            <div className="mb-2 flex items-center justify-evenly gap-2">
                <p className="font-bold">{title}</p>
                <Bullet />
                <a
                    href={ricePath}
                    target="_blank"
                    className="text-blue hover:text-light-blue underline transition-colors"
                >
                    {ricePath}
                </a>
                <Bullet />
                <p className="text-foreground/80">
                    {formatLocaleDate(createdAt)}
                </p>
            </div>
            <div>
                <img
                    className="aspect-video w-full"
                    src={thumbnail}
                    alt="rice's thumbnail"
                />
            </div>
            <div className="font-jetbrains-mono mt-3 flex justify-evenly font-bold">
                <p>
                    Stars:
                    <span className="text-foreground/60 ml-1">[ {stars} ]</span>
                </p>
                <Bullet />
                <p>
                    Downloads:
                    <span className="text-foreground/60 ml-1">
                        [ {downloads} ]
                    </span>
                </p>
            </div>
        </div>
    );
}
