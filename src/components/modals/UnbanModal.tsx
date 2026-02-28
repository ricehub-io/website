import { FormButton } from "@/components/form/FormButton";
import { AppState } from "@/lib/appState";
import { TargetedEvent } from "preact/compat";
import { useContext } from "preact/hooks";

export default function UnbanModal() {
    const { unbanCtx, currentModal, modalCallback } = useContext(AppState);

    const onSubmit = (e: TargetedEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        modalCallback.value();
        e.currentTarget.reset();
    };

    return (
        unbanCtx.value !== null && (
            <form
                onSubmit={onSubmit}
                onReset={() => (currentModal.value = null)}
            >
                <p className="mx-2 text-base leading-5 sm:text-lg">
                    You are going to unban <b>{unbanCtx.value.displayName}</b>{" "}
                    (@
                    {unbanCtx.value.username})
                </p>
                <p className="text-gray mx-2 mt-2 text-sm leading-5 sm:text-base">
                    Please confirm the action with buttons below.
                </p>
                <div className="mt-2 flex gap-2">
                    <FormButton label="Cancel" type="reset" />
                    <FormButton label="Confirm" type="submit" />
                </div>
            </form>
        )
    );
}
