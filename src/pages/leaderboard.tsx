import { apiFetch } from "@/api/apiFetch";
import { LeaderboardRice, LeaderboardRiceSchema } from "@/api/schemas";
import PageTitle from "@/components/PageTitle";
import { RadioButton, RadioButtonProps } from "@/components/RadioButton";
import StarButton from "@/components/StarButton";
import { addNotification } from "@/lib/appState";
import { numberWithOrdinal } from "@/lib/math";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { useSignal } from "@preact/signals";
import { TargetedEvent } from "preact/compat";
import { useEffect } from "preact/hooks";

const PERIOD_OPTIONS = ["week", "month", "year"] as const;
const PERIOD_BUTTONS: RadioButtonProps[] = [
    {
        text: "This Week",
        value: "week",
        defaultChecked: true,
    },
    {
        text: "This Month",
        value: "month",
    },
    {
        text: "This Year",
        value: "year",
    },
] as const;

type PeriodOption = (typeof PERIOD_OPTIONS)[number];

export default function LeaderboardPage() {
    const period = useSignal<PeriodOption>("week");
    const rices = useSignal<LeaderboardRice[]>([]);

    const fetchLeaderboard = async (period: PeriodOption) => {
        try {
            const [_, body] = await apiFetch(
                "GET",
                `/leaderboard/${period}`,
                null,
                LeaderboardRiceSchema.array()
            );

            rices.value = body;
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Failed to fetch leaderboard",
                    e.message,
                    "error"
                );
            }
        }
    };

    useEffect(() => {
        fetchLeaderboard(period.value);
    }, [period.value]);

    const changePeriod = (e: TargetedEvent<HTMLInputElement>) => {
        period.value = e.currentTarget.value as PeriodOption;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <PageTitle text="Leaderboard" />
            <div className="hidden md:flex">
                {PERIOD_BUTTONS.map((props) => (
                    <RadioButton
                        key={props.value}
                        {...props}
                        className="px-4 py-2"
                        name="sortOption"
                        onChange={changePeriod}
                    />
                ))}
            </div>
            <div className="flex flex-col gap-2">
                {rices.value.map((rice) => (
                    <Rice key={rice.id} {...rice} />
                ))}
            </div>
        </div>
    );
}

const Rice = ({
    position,
    id,
    title,
    displayName,
    thumbnail,
    comments,
    stars,
    downloads,
    isStarred,
}: LeaderboardRice) => (
    <div className="bg-bright-background hover:outline-blue cursor-pointer rounded-md p-4 outline-2 outline-transparent transition-colors duration-300">
        <div className="flex items-center gap-2 text-lg">
            <p className="text-xl font-bold">{numberWithOrdinal(position)}</p>
            <p>{title}</p>
            <p className="ml-auto">by {displayName}</p>
        </div>
        <div className="my-2">
            <img
                className="h-60 rounded-sm object-cover"
                src={thumbnail}
                alt="thumbnail"
            />
        </div>
        <div className="flex justify-evenly gap-4">
            <div className="flex items-center gap-1">
                <ChatBubbleOvalLeftIcon className="size-4 sm:size-5" />
                <p>{comments}</p>
            </div>
            <StarButton riceId={id} stars={stars} isStarred={isStarred} />
            <div className="flex items-center gap-1">
                <ArrowDownTrayIcon className="size-4 sm:size-5" />
                <p>{downloads}</p>
            </div>
        </div>
    </div>
);
