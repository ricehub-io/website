import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import moment from "moment";
import { apiFetch } from "@/api/apiFetch";
import PageTitle from "@/components/PageTitle";
import { addNotification } from "@/lib/appState";
import { sanitizeMarkdownInput } from "@/lib/sanitize";
import { WebsiteVariable, WebsiteVariableSchema } from "@/api/schemas";

export default function PrivacyPolicyPage() {
    const data = useSignal<WebsiteVariable>(null);

    // fetch privacy policy content from db
    useEffect(() => {
        apiFetch(
            "GET",
            "/vars/privacy_policy_text",
            null,
            WebsiteVariableSchema
        )
            .then(([, body]) => (data.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification("Something went wrong", e.message, "error");
                }
            });
    }, []);

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
