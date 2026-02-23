import { MagnifyingGlassIcon } from "./icons/MagnifyingGlassIcon";
import { useLocation } from "preact-iso";
import { useContext } from "preact/hooks";
import { addNotification, AppState, ModalType } from "../lib/appState";
import { API_URL } from "../lib/api";
import Link, { LinkProps } from "./Link";
import BarsIcon from "./icons/BarsIcon";
import { useSignal } from "@preact/signals";
import XMarkIcon from "./icons/XMarkIcon";

interface TextButtonProps {
    text: string;
    onClick?: () => void;
}

export default function Header() {
    const { route } = useLocation();
    const navOpen = useSignal(false);
    // I added cooldown to nav menu because spamming breaks it :(
    const navCooldown = useSignal(false);

    const openNavMenu = () => {
        if (navCooldown.value) {
            return;
        }

        navCooldown.value = true;
        navOpen.value = !navOpen.value;
        setTimeout(() => (navCooldown.value = false), 500);
    };

    return (
        <header className="bg-dark-background sticky top-0 flex items-center justify-between px-6 py-3 z-40">
            <h1
                onClick={() => route("/")}
                onMouseDown={(e: MouseEvent) => {
                    if (e.button === 1)
                        window.open("/", "_blank", "rel=noopener noreferrer");
                }}
                className="font-ranchers text-4xl font-extrabold select-none hover:cursor-pointer"
            >
                RiceHub
            </h1>
            <SearchBar placeholder="Search for rices..." disabled />
            {/* normal nav bar with clickable links */}
            <div className="hidden md:flex gap-6">
                <HeaderLinks />
            </div>
            {/* hamburger menu nav bar for small screens */}
            <button
                className="md:hidden text-bright-gray cursor-pointer"
                onClick={openNavMenu}
            >
                <BarsIcon className={navOpen.value ? "hidden" : "block"} />
                <XMarkIcon
                    className={`size-8 ${navOpen.value ? "block" : "hidden"}`}
                />
            </button>
            <div
                className={`${navOpen.value ? "flex" : "hidden"} absolute left-0 top-full bg-dark-background w-full border-t border-bright-background px-6 pb-4 pt-2 flex-col items-start gap-y-3 rounded-b-lg`}
            >
                <HeaderLinks onLinkClicked={() => (navOpen.value = false)} />
            </div>
        </header>
    );
}

const HeaderLinks = ({ onLinkClicked }: { onLinkClicked?: () => void }) => {
    const { currentModal, user, accessToken } = useContext(AppState);

    const logOut = () => {
        onLinkClicked();
        fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        accessToken.value = null;
        user.value = null;
        addNotification(
            "Log Out",
            "You have been logged out of your account",
            "info"
        );
    };

    const setModal = (type: ModalType) => {
        onLinkClicked();
        currentModal.value = type;
    };

    const HeaderLink = (props: LinkProps) => (
        <Link
            onClick={onLinkClicked}
            className="text-bright-gray hover:text-blue text-lg md:text-base transition-colors"
            {...props}
        />
    );

    return (
        <>
            <HeaderLink url="/" content="Home" />
            {accessToken.value === null ? (
                <>
                    <TextButton
                        text="Login"
                        onClick={() => setModal("login")}
                    />
                    <TextButton
                        text="Register"
                        onClick={() => setModal("register")}
                    />
                </>
            ) : (
                <>
                    <HeaderLink url="/new-rice" content="New Rice" />
                    <HeaderLink url="/account" content="Account" />
                    <TextButton text="Log Out" onClick={logOut} />
                </>
            )}
        </>
    );
};

function TextButton({ text, onClick }: TextButtonProps) {
    return (
        <input
            className="text-bright-gray hover:text-blue text-lg md:text-base transition-colors hover:cursor-pointer"
            type="button"
            value={text}
            onClick={onClick}
        />
    );
}

function SearchBar({
    placeholder,
    disabled,
}: {
    placeholder: string;
    disabled?: boolean;
}) {
    return (
        <div className="hidden bg-bright-background focus-within:border-primary absolute left-1/2 lg:flex -translate-x-1/2 items-center gap-2 rounded-lg border-2 border-transparent px-2 py-2 transition-colors duration-300 ease-out has-disabled:cursor-not-allowed has-disabled:opacity-30">
            <MagnifyingGlassIcon />
            <input
                className="placeholder:text-gray outline-none disabled:cursor-not-allowed"
                type="text"
                placeholder={placeholder}
                disabled={disabled}
            />
        </div>
    );
}
