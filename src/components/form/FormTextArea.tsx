import { JSX } from "preact/jsx-runtime";
import FormLabel from "./FormLabel";

const textAreaStyle =
    "bg-bright-background rounded-md w-full outline-none px-6 py-4 text-lg focus:bg-gray/30 transition-[background-color] duration-300";

interface FormTextAreaProps extends JSX.TextareaHTMLAttributes {
    name: string;
    label?: string;
}

export default function FormTextArea({
    name,
    label,
    ...props
}: FormTextAreaProps) {
    if (props.className !== undefined) {
        props.className += " " + textAreaStyle;
    } else {
        props.className = textAreaStyle;
    }

    return (
        <div>
            {label !== undefined && <FormLabel label={label} htmlFor={name} />}
            <textarea name={name} id={name} rows={15} required {...props} />
        </div>
    );
}
