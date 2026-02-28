import { TargetedEvent } from "preact/compat";
import ListWrapper from "./ListWrapper";
import { useSignal } from "@preact/signals";
import UserList from "./UserList";
import CommentList from "./CommentList";
import RiceList from "./RiceList";

// how many recent resources should be returned at most
const RESOURCE_LIMIT = 20;

export default function ResourceList() {
    const resourceType = useSignal<string>("users");

    const changeType = (e: TargetedEvent<HTMLInputElement>) => {
        resourceType.value = e.currentTarget.value;
    };

    return (
        <ListWrapper
            label={`most recent ${resourceType.value}`}
            buttons={[
                {
                    text: "Users",
                    name: "type",
                    value: "users",
                    defaultChecked: true,
                    onChange: changeType,
                },
                {
                    text: "Rices",
                    name: "type",
                    value: "rices",
                    onChange: changeType,
                },
                {
                    text: "Comments",
                    name: "type",
                    value: "comments",
                    onChange: changeType,
                },
            ]}
        >
            {resourceType.value === "users" && (
                <UserList userLimit={RESOURCE_LIMIT} />
            )}
            {resourceType.value === "comments" && (
                <CommentList commentLimit={RESOURCE_LIMIT} />
            )}
            {resourceType.value === "rices" && <RiceList />}
        </ListWrapper>
    );
}
