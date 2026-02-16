export {};

declare global {
    interface Window {
        __APP_CONFIG__: {
            API_URL: string;
        };
    }
}
