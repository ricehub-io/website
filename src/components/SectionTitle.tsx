interface SectionTitleProps {
    text: string;
}

export default function SectionTitle({ text }: SectionTitleProps) {
    return (
        <h2 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">
            {text}
        </h2>
    );
}
