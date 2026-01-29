interface FormInputProps {
    label: string;
    name: string;
    placeholder: string;
    type: "text" | "password";
    errorMsg?: string;
    onInput?: () => void;
}

export function FormInput({ label, name, placeholder, type, errorMsg, onInput }: FormInputProps) {
    return (
        <div className="not-last:mb-2 max-w-80">
            <label className="block" htmlFor={name}>
                {label}
            </label>
            <input
                className={`block w-full bg-bright-background px-6 py-3 text-lg rounded-md transition-[background-color] duration-300 outline-2 focus:bg-gray/30 ${
                    errorMsg ? "outline-red" : "outline-transparent"
                }`}
                type={type}
                name={name}
                id={name}
                placeholder={placeholder}
                required
                onInput={onInput}
            />
            {errorMsg && (
                <p className="text-red text-sm mt-0.5 whitespace-normal break-words w-full">{errorMsg}</p>
            )}
        </div>
    );
}
