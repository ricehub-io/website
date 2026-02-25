import { InputHTMLAttributes } from "preact/compat";
import FormLabel from "./FormLabel";

interface FormInputProps extends InputHTMLAttributes {
    label: string;
    errorMsg?: string;
    name: string;
    onInput?: () => void;
}

export function FormInput({ label, errorMsg, ...props }: FormInputProps) {
    return (
        <div className="w-full not-last:mb-2">
            <FormLabel label={label} htmlFor={props.name} />
            <input
                {...props}
                className={`bg-bright-background focus:bg-gray/30 block w-full rounded-md p-3 text-sm outline-2 transition-[background-color] duration-300 sm:text-base md:text-lg ${
                    errorMsg ? "outline-red" : "outline-transparent"
                } ${props.className}`}
                required
            />
            {errorMsg && (
                <p className="text-red mt-0.5 w-full text-sm break-words whitespace-normal sm:text-base">
                    {errorMsg}
                </p>
            )}
        </div>
    );
}
