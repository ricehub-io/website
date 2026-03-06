import { useContext, useEffect } from "preact/hooks";
import UnbanModal from "@/components/modals/UnbanModal";
import ChangeAvatarModal from "@/components/modals/ChangeAvatarModal";
import ChangeDisplayNameModal from "@/components/modals/ChangeDisplayNameModal";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import DeleteAvatarModal from "@/components/modals/DeleteAvatarModal";
import DeleteResourceModal from "@/components/modals/DeleteResourceModal";
import DeleteRiceModal from "@/components/modals/DeleteRiceModal";
import LoginModal from "@/components/modals/LoginModal";
import RegisterModal from "@/components/modals/RegisterModal";
import ReportModal from "@/components/modals/ReportModal";
import { AppState } from "@/lib/appState";
import OkayModal from "@/components/modals/OkayModal";

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
                <div className="bg-dark-background border-gray/30 w-full rounded-xl border-2 px-12 py-6 sm:w-100 md:w-150">
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
                    {currentModal.value === "okay" && <OkayModal />}

                    {/* admin-only modals */}
                    {currentModal.value === "admin_deleteResource" && (
                        <DeleteResourceModal />
                    )}
                    {currentModal.value === "admin_unban" && <UnbanModal />}
                </div>
            </div>
        )
    );
}
