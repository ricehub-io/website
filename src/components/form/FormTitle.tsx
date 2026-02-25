interface FormTitleProps {
    text: string;
    className?: string;
}

export default function FormTitle({ text, className }: FormTitleProps) {
    return (
        <h1
            className={`text-center text-2xl font-bold md:text-3xl ${className}`}
        >
            {text}
        </h1>
    );
}
