import { MagnifyingGlassIcon } from "./icons/MagnifyingGlassIcon";
import { useLocation } from "preact-iso";
import { useContext } from "preact/hooks";
import { addNotification, AppState } from "../lib/appState";
import { API_URL } from "../lib/api";
import Link from "./Link";

interface TextButtonProps {
    text: string;
    onClick?: () => void;
}

export default function Header() {
    const HeaderLink = ({ text, url }: { text: string; url: string }) => (
        <Link
            content={text}
            url={url}
            inNewTab
            className="text-bright-gray hover:text-blue transition-colors"
        />
    );

    const { route } = useLocation();
    const { currentModal, user, accessToken } = useContext(AppState);

    const logOut = () => {
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

    return (
        <header className="bg-dark-background flex items-center justify-between px-6 py-3">
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
            <div className="flex gap-6">
                <HeaderLink url="/" text="Home" />
                {accessToken.value === null ? (
                    <>
                        <TextButton
                            text="Login"
                            onClick={() => (currentModal.value = "login")}
                        />
                        <TextButton
                            text="Register"
                            onClick={() => (currentModal.value = "register")}
                        />
                    </>
                ) : (
                    <>
                        <HeaderLink url="/new-rice" text="New Rice" />
                        <HeaderLink url="/account" text="Account" />
                        <TextButton text="Log Out" onClick={logOut} />
                    </>
                )}
            </div>
        </header>
    );
}

function TextButton({ text, onClick }: TextButtonProps) {
    return (
        <input
            className="text-bright-gray hover:text-blue transition-colors hover:cursor-pointer"
            type="button"
            value={text}
            onClick={onClick}
        />
    );
}

// function Link({ url, text, children, external }: LinkProps) {
//     return (
//         <a
//             className="text-bright-gray hover:text-primary transition-colors duration-500"
//             href={url}
//             target={external ? "_blank" : "_self"}
//         >
//             {text ?? children}
//         </a>
//     );
// }

function SearchBar({
    placeholder,
    disabled,
}: {
    placeholder: string;
    disabled?: boolean;
}) {
    return (
        <div className="bg-bright-background focus-within:border-primary absolute left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg border-2 border-transparent px-2 py-2 transition-colors duration-300 ease-out has-disabled:cursor-not-allowed has-disabled:opacity-30">
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
