interface SectionTitleProps {
    text: string;
}

export default function SectionTitle({ text }: SectionTitleProps) {
    return <h2 className="mb-2 text-2xl font-bold md:text-3xl">{text}</h2>;
}
