import { useEffect } from "preact/hooks";
import { apiFetch } from "../lib/api";
import DiscordIcon from "./icons/DiscordIcon";
import { GitHubIcon } from "./icons/GitHubIcon";
import Link, { LinkProps } from "./Link";
import { Signal, useSignal } from "@preact/signals";
import { Link as LinkDTO } from "../lib/models";
import { addNotification } from "../lib/appState";
import Bullet from "./Bullet";

const VERSION_MAJOR: number = 1;
const VERSION_MINOR: number = 6;

export default function Footer() {
    const discord = useSignal("");
    const github = useSignal("");

    // emmmm actually this is bad
    // its only temporary ok?
    useEffect(() => {
        const fetchLink = (linkName: string, linkSignal: Signal<string>) =>
            apiFetch<LinkDTO>("GET", `/links/${linkName}`)
                .then(([_, body]) => (linkSignal.value = body.url))
                .catch((e) => {
                    if (e instanceof Error) {
                        addNotification(
                            "Failed to fetch link URL",
                            e.message,
                            "warning"
                        );
                    }
                });

        fetchLink("discord", discord);
        fetchLink("github", github);
    }, []);

    return (
        <footer className="bg-dark-background text-foreground/60 mt-auto flex flex-col items-center justify-between gap-y-4 px-10 py-6 sm:px-6 lg:flex-row lg:py-3">
            <div>
                <p className="inline">
                    v{VERSION_MAJOR}.{VERSION_MINOR}
                </p>
                <Bullet />
                <p className="inline break-keep whitespace-nowrap">
                    made with love by{" "}
                    <Link
                        url="https://github.com/golferjoe"
                        content="golferjoe"
                        inNewTab
                    />{" "}
                    <span className="font-ibm-plex-mono tracking-[-0.15em]">
                        :3
                    </span>
                </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <FooterLink
                    url="/terms-of-service"
                    content="Terms of Service"
                />
                <FooterLink url="/privacy-policy" content="Privacy Policy" />
                <FooterLink
                    url={github.value}
                    inNewTab
                    content={
                        <span className="flex items-center gap-1">
                            <GitHubIcon className="size-5" />
                            Source Code
                        </span>
                    }
                />
                <FooterLink
                    url={discord.value}
                    inNewTab
                    content={
                        <span className="flex items-center gap-1">
                            <DiscordIcon className="size-5" />
                            Community
                        </span>
                    }
                />
            </div>
        </footer>
    );
}

const FooterLink = (props: LinkProps) => (
    <Link {...props} className="hover:text-blue transition-colors" />
);
