import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Link as LinkDTO, WebsiteVariable } from "../lib/models";
import { apiFetch } from "../lib/api";
import { addNotification } from "../lib/appState";
import { sanitizeMarkdownInput, superChargeMarkdown } from "../lib/sanitize";
import moment from "moment";
import PageTitle from "../components/PageTitle";

export default function PrivacyPolicyPage() {
    const discord = useSignal<string>(null);
    const discordFetched = useSignal(false);
    const data = useSignal<WebsiteVariable>(null);
    const dataFetched = useSignal(false);

    // fetch privacy policy content from db
    useEffect(() => {
        apiFetch<WebsiteVariable>("GET", "/vars/privacy_policy_text")
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

    // fetch discord link from db
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

    // supercharge markdown with our discord link
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
                <PageTitle text="Privacy Policy" />
                <p className="text-gray my-2 text-sm sm:text-base md:text-lg">
                    Last updated:{" "}
                    {moment(data.value.updatedAt).format("MMMM Do, YYYY")}
                </p>
                <div className="bg-bright-background mb-4 h-0.5 w-full" />
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
