import { useContext } from "preact/hooks";
import { AppState } from "../lib/appState";
import { LoginModal } from "./LoginModal";
import { RegisterModal } from "./RegisterModal";
import ChangeDisplayNameModal from "./modals/ChangeDisplayNameModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import DeleteAccountModal from "./modals/DeleteAccountModal";
import ChangeAvatarModal from "./modals/ChangeAvatarModal";

export function ModalConsumer() {
    const { currentModal } = useContext(AppState);

    return (
        currentModal.value !== null && (
            <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center bg-background/50">
                <div className="bg-dark-background px-12 py-6 rounded-xl border-2 border-gray/30">
                    {currentModal.value === "login" && <LoginModal />}
                    {currentModal.value === "register" && <RegisterModal />}
                    {currentModal.value === "changeDisplayName" && (
                        <ChangeDisplayNameModal />
                    )}
                    {currentModal.value === "changePassword" && (
                        <ChangePasswordModal />
                    )}
                    {currentModal.value === "deleteAccount" && (
                        <DeleteAccountModal />
                    )}
                    {currentModal.value === "changeAvatar" && (
                        <ChangeAvatarModal />
                    )}
                </div>
            </div>
        )
    );
}
