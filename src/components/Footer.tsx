import { useEffect } from "preact/hooks";
import { Signal, useSignal } from "@preact/signals";
import { addNotification } from "@/lib/appState";
import { apiFetch } from "@/api/apiFetch";
import Bullet from "@/components/Bullet";
import Link, { LinkProps } from "@/components/Link";
import { GitHubIcon } from "@/components/icons/GitHubIcon";
import DiscordIcon from "@/components/icons/DiscordIcon";
import { ExternalLinkSchema } from "@/api/schemas";

export default function Footer() {
    const discord = useSignal("");
    const github = useSignal("");

    useEffect(() => {
        const fetchLink = (linkName: string, linkSignal: Signal<string>) =>
            apiFetch("GET", `/links/${linkName}`, null, ExternalLinkSchema)
                .then(([, body]) => (linkSignal.value = body.url))
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
                <p className="inline">v{__APP_VERSION__}</p>
                <Bullet />
                <p className="inline break-keep whitespace-nowrap">
                    made by{" "}
                    <Link
                        url="https://github.com/unaimeds"
                        content="unaimeds"
                        inNewTab
                    />{" "}
                    & contributors
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
