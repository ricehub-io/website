export {};

declare global {
    const __APP_VERSION__: string;

    interface Window {
        __APP_CONFIG__: {
            API_URL: string;
        };
    }
}
