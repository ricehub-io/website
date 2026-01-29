import { ComponentChildren } from "preact";
import { GithubIcon } from "./icons/GithubIcon";
import { MagnifyingGlassIcon } from "./icons/MagnifyingGlassIcon";
import { useLocation } from "preact-iso";
import { useContext } from "preact/hooks";
import { AppState } from "../lib/appState";

interface LinkProps {
    url: string;
    text?: string;
    children?: ComponentChildren;
    external?: boolean;
}

interface TextButtonProps {
    text: string;
    onClick?: () => void;
}

interface SearchBarProps {
    placeholder: string;
}

export function Header() {
    const { route } = useLocation();
    const { currentModal, accessToken } = useContext(AppState);

    return (
        <header className="flex justify-between items-center bg-dark-background px-6 py-3">
            <h1
                onClick={() => route("/")}
                className="font-extrabold font-ranchers text-4xl select-none hover:cursor-pointer"
            >
                RiceHub
            </h1>
            <SearchBar placeholder="Search for rices..." />
            <div className="flex gap-6">
                <Link url="/" text="Home" />
                {accessToken.value === null ? (
                    <>
                        <TextButton text="Login" onClick={() => (currentModal.value = "login")} />
                        <TextButton text="Register" onClick={() => (currentModal.value = "register")} />
                    </>
                ) : (
                    <Link url="/account" text="Account" />
                )}
                <Link url="https://github.com" external>
                    <GithubIcon />
                </Link>
            </div>
        </header>
    );
}

function TextButton({ text, onClick }: TextButtonProps) {
    return (
        <input
            className="text-bright-gray transition-colors duration-500 hover:cursor-pointer hover:text-primary"
            type="button"
            value={text}
            onClick={onClick}
        />
    );
}

function Link({ url, text, children, external }: LinkProps) {
    return (
        <a
            className="text-bright-gray hover:text-primary transition-colors duration-500"
            href={url}
            target={external ? "_blank" : "_self"}
        >
            {text ?? children}
        </a>
    );
}

function SearchBar({ placeholder }: SearchBarProps) {
    return (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-bright-background px-2 py-2 rounded-lg transition-colors duration-300 ease-out border-2 border-transparent focus-within:border-primary">
            <MagnifyingGlassIcon />
            <input className="outline-none placeholder:text-gray" type="text" placeholder={placeholder} />
        </div>
    );
}
