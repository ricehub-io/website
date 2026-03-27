import { apiFetchV2 } from "@/api/apiFetch";
import { SubscriptionLinkSchema } from "@/api/schemas";
import PageTitle from "@/components/PageTitle";
import { addNotification } from "@/lib/appState";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export default function SubscriptionPage() {
    const checkoutUrl = useSignal<string>(null);

    useEffect(() => {
        apiFetchV2("GET", "/links/subscription", null, SubscriptionLinkSchema)
            .then(([_, body]) => {
                checkoutUrl.value = body.checkoutUrl;
                PolarEmbedCheckout.init();
            })
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch checkout link",
                        e.message,
                        "error"
                    );
                }
            });
    }, []);

    return (
        <div className="flex flex-col items-center gap-4">
            <PageTitle text="Subscription" />
            <p className="text-lg">Lorem ipsum dolor sit amet</p>
            <a
                className="bg-blue rounded-lg px-6 py-2 text-lg font-bold"
                href={checkoutUrl.value}
                data-polar-checkout
                data-polar-checkout-theme="dark"
            >
                Purchase
            </a>
        </div>
    );
}
