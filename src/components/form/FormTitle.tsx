interface FormTitleProps {
    text: string;
}

export default function FormTitle({ text }: FormTitleProps) {
    return <h1 className="text-center font-extrabold text-3xl mb-4">{text}</h1>;
}
