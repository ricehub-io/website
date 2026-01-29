export function Placeholder({ className = "" }: { className?: string }) {
    return <div className={`bg-bright-background animate-pulse rounded-md ${className}`} />;
}
