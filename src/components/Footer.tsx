import { useEffect } from "preact/hooks";
import { API_URL, apiFetch } from "../lib/api";
import DiscordIcon from "./icons/DiscordIcon";
import { GitHubIcon } from "./icons/GitHubIcon";
import Link, { LinkProps } from "./Link";
import { Signal, useSignal } from "@preact/signals";
import { Link as LinkDTO } from "../lib/models";
import { addNotification } from "../lib/appState";

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
        <footer className="flex flex-col gap-y-4 lg:flex-row lg:py-3 items-center justify-between bg-dark-background mt-auto px-6 py-6 text-foreground/60">
            <div>
                <p className="inline">v1.0</p>
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
            <div className="flex flex-wrap justify-center items-center gap-y-2 gap-x-6">
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
    <Link {...props} className="transition-colors hover:text-blue" />
);
const Bullet = () => <span className="text-foreground/20 mx-2">&#9679;</span>;
