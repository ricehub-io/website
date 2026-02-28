import { InputHTMLAttributes } from "preact/compat";

interface TextButtonProps extends InputHTMLAttributes {
    text: string;
    className?: string;
}

export default function TextButton({ text, ...props }: TextButtonProps) {
    return (
        <input
            className={`text-blue hover:text-light-blue cursor-pointer`}
            type="button"
            value={`[ ${text} ]`}
            {...props}
        />
    );
}
