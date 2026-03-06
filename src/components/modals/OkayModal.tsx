import { FormButton } from "@/components/form/FormButton";
import { AppState } from "@/lib/appState";
import { useContext } from "preact/hooks";

export default function OkayModal() {
    const { currentModal, okayModalCtx, modalCallback } = useContext(AppState);

    const okayClicked = () => {
        console.log("ok.");
        modalCallback.value?.();
        currentModal.value = null;
    };

    if (!okayModalCtx.value) {
        console.error("Tried opening okay modal but context is not set!");
        return;
    }

    return (
        <form onSubmit={okayClicked}>
            <div className="flex flex-col gap-2 text-lg">
                {okayModalCtx.value.content}
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="Okay" type="submit" />
            </div>
        </form>
    );
}
