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
        apiFetchV2("GET", "/rices?sort=recent", null, FetchRicesSchema)
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
    comments,
    downloads,
}: PartialRice) {
    const ricePath = `/${username}/${slug}`;

    return (
        <div className="bg-background-2 rounded-md p-4 text-sm sm:text-base">
            <div className="mb-2 flex flex-col justify-evenly gap-x-2 gap-y-0.5 md:flex-row md:items-center">
                <p className="font-bold">{title}</p>
                <Bullet className="hidden md:block" />
                <a
                    href={ricePath}
                    target="_blank"
                    className="text-blue hover:text-light-blue underline transition-colors"
                >
                    {ricePath}
                </a>
                <Bullet className="hidden md:block" />
                <p className="text-foreground/80">
                    <span className="md:hidden">Created: </span>
                    <span className="font-medium md:font-normal">
                        {formatLocaleDate(createdAt)}
                    </span>
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
                <InteractionCount text="Stars" value={stars} />
                <Bullet />
                <InteractionCount text="Downloads" value={downloads} />
                <Bullet />
                <InteractionCount text="Comments" value={comments} />
            </div>
        </div>
    );
}

const InteractionCount = ({ text, value }: { text: string; value: number }) => (
    <p>
        {text}: <span className="text-foreground/60 ml-1">[ {value} ]</span>
    </p>
);
