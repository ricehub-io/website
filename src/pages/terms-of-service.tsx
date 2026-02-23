import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { apiFetch } from "../lib/api";
import { addNotification } from "../lib/appState";
import { Link as LinkDTO, WebsiteVariable } from "../lib/models";
import { sanitizeMarkdownInput, superChargeMarkdown } from "../lib/sanitize";
import moment from "moment";

export default function TermsOfServicePage() {
    const discord = useSignal<string>(null);
    const discordFetched = useSignal(false);
    const data = useSignal<WebsiteVariable>(null);
    const dataFetched = useSignal(false);

    useEffect(() => {
        apiFetch<WebsiteVariable>("GET", "/vars/terms_of_service_text")
            .then(([_, body]) => {
                data.value = body;
                dataFetched.value = true;
            })
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification("Something went wrong", e.message, "error");
                }
            });
    }, []);

    useEffect(() => {
        apiFetch<LinkDTO>("GET", "/links/discord")
            .then(([_, body]) => {
                discord.value = body.url;
                discordFetched.value = true;
            })
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch discord link",
                        e.message,
                        "warning"
                    );
                }
            });
    }, []);

    useEffect(() => {
        if (data.value === null || discord.value === null) {
            return;
        }

        const vars: Map<string, string> = new Map([
            ["DISCORD_URL", discord.value],
        ]);
        const md = superChargeMarkdown(data.value.value, vars);
        data.value = {
            ...data.value,
            value: md,
        };
    }, [discordFetched.value, dataFetched.value]);

    return (
        data.value !== null && (
            <div className="legal-page mx-auto">
                <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl">
                    Terms of Service
                </h1>
                <p className="text-gray my-2 text-sm sm:text-base md:text-lg">
                    Last updated:{" "}
                    {moment(data.value.updatedAt).format("MMMM Do, YYYY")}
                </p>
                <div className="w-full h-0.5 bg-bright-background mb-4" />
                <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeMarkdownInput(data.value.value),
                    }}
                />
            </div>
        )
    );
}
