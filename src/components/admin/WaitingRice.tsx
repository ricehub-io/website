import { PartialRice } from "@/api/schemas";
import TextButton from "@/components/admin/TextButton";
import moment from "moment";

interface WaitingRiceProps extends PartialRice {
    onAccept: () => void;
    onReject: () => void;
}

export default function WaitingRice({
    title,
    username,
    slug,
    displayName,
    createdAt,
    onAccept,
    onReject,
}: WaitingRiceProps) {
    const ricePath = `/${username}/${slug}`;

    const onView = () => window.open(ricePath, "_blank", "noopener,noreferrer");

    return (
        <div className="bg-background-2 flex flex-col gap-1 rounded-md p-4 text-sm sm:text-base">
            <div className="flex justify-between">
                <div>
                    <p className="font-medium sm:text-lg">{title}</p>
                    <p className="text-gray">{ricePath}</p>
                </div>
                <div className="text-right">
                    <p className="font-medium">by {displayName}</p>
                    <p className="text-gray">
                        created {moment(createdAt).fromNow()}
                    </p>
                </div>
            </div>
            <div className="flex justify-center gap-6">
                <TextButton text="view" onClick={onView} />
                <TextButton text="accept" onClick={onAccept} />
                <TextButton text="reject" onClick={onReject} />
            </div>
        </div>
    );
}
