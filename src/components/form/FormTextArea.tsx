import FormLabel from "./FormLabel";
import { TextareaHTMLAttributes } from "preact/compat";

interface FormTextAreaProps extends TextareaHTMLAttributes {
    name: string;
    label?: string;
}

export default function FormTextArea({
    name,
    label,
    ...props
}: FormTextAreaProps) {
    return (
        <div>
            {label !== undefined && <FormLabel label={label} htmlFor={name} />}
            <textarea
                {...props}
                name={name}
                id={name}
                rows={props.rows ?? 15}
                required
                className={`bg-bright-background focus:bg-gray/30 w-full rounded-md px-3 py-2 text-sm transition-[background-color] duration-300 outline-none sm:px-4 sm:text-base md:text-lg ${props.className}`}
            />
        </div>
    );
}
