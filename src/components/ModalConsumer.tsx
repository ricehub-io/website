import { useContext, useEffect } from "preact/hooks";
import { AppState } from "../lib/appState";
import LoginModal from "./modals/LoginModal";
import RegisterModal from "./modals/RegisterModal";
import ChangeDisplayNameModal from "./modals/ChangeDisplayNameModal";
import ChangePasswordModal from "./modals/ChangePasswordModal";
import DeleteAccountModal from "./modals/DeleteAccountModal";
import ChangeAvatarModal from "./modals/ChangeAvatarModal";
import DeleteAvatarModal from "./modals/DeleteAvatarModal";
import DeleteRiceModal from "./modals/DeleteRiceModal";
import CreateReportModal from "./modals/CreateReportModal";
import DeleteResourceModal from "./modals/DeleteResourceModal";

export default function ModalConsumer() {
    const { currentModal } = useContext(AppState);

    // disable page scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow =
            currentModal.value === null ? "visible" : "hidden";
    }, [currentModal.value]);

    return (
        currentModal.value !== null && (
            <div className="fixed left-0 top-0 w-full h-full flex items-center justify-center bg-background/70">
                <div className="bg-dark-background px-12 py-6 rounded-xl border-2 border-gray/30 w-150">
                    {currentModal.value === "login" && <LoginModal />}
                    {currentModal.value === "register" && <RegisterModal />}
                    {currentModal.value === "changeDisplayName" && (
                        <ChangeDisplayNameModal />
                    )}
                    {currentModal.value === "changePassword" && (
                        <ChangePasswordModal />
                    )}
                    {currentModal.value === "changeAvatar" && (
                        <ChangeAvatarModal />
                    )}
                    {currentModal.value === "deleteAvatar" && (
                        <DeleteAvatarModal />
                    )}
                    {currentModal.value === "deleteAccount" && (
                        <DeleteAccountModal />
                    )}
                    {currentModal.value === "deleteRice" && <DeleteRiceModal />}
                    {currentModal.value === "createReport" && (
                        <CreateReportModal />
                    )}

                    {/* admin-only modals */}
                    {currentModal.value === "admin_deleteResource" && (
                        <DeleteResourceModal />
                    )}
                </div>
            </div>
        )
    );
}
