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
import ReportModal from "./modals/ReportModal";
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
            <div className="bg-background/70 fixed top-0 left-0 flex h-full w-full items-center justify-center px-2 sm:px-0">
                <div className="bg-dark-background border-gray/30 w-full md:w-150 rounded-xl border-2 px-12 py-6">
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
                    {currentModal.value === "report" && <ReportModal />}

                    {/* admin-only modals */}
                    {currentModal.value === "admin_deleteResource" && (
                        <DeleteResourceModal />
                    )}
                </div>
            </div>
        )
    );
}
