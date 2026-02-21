import { JSX } from "preact";

export interface RadioButtonProps extends JSX.InputHTMLAttributes {
    text: string;
    value: string;
}

export function RadioButton({
    text,
    name,
    className,
    ...props
}: RadioButtonProps) {
    return (
        <label
            className={`bg-gray/20 border-gray/60 hover:bg-gray/40 has-checked:border-blue has-checked:bg-blue/40 cursor-pointer rounded-md border px-3 py-1 transition-colors select-none not-first:ml-2 ${className}`}
            htmlFor={text.toLowerCase()}
        >
            <input
                className="hidden"
                type="radio"
                name={name}
                id={text.toLowerCase()}
                {...props}
            />
            {text}
        </label>
    );
}
