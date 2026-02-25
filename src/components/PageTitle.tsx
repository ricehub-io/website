interface PageTitleProps {
    text: string;
    className?: string;
}

export default function PageTitle({ text, className }: PageTitleProps) {
    return (
        <h1
            className={`text-3xl font-bold sm:text-4xl md:text-5xl ${className}`}
        >
            {text}
        </h1>
    );
}
