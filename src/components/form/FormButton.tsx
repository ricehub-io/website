interface FormButtonProps {
    label: string;
    type: "submit" | "reset";
    disabled?: boolean;
}

export function FormButton({ label, type, disabled }: FormButtonProps) {
    return (
        <input
            className="bg-bright-background hover:bg-gray/30 disabled:text-gray disabled:bg-bright-background/50 w-full rounded-md py-3 text-base font-medium transition-colors duration-300 hover:cursor-pointer disabled:cursor-not-allowed sm:text-lg md:text-xl"
            type={type}
            value={label}
            disabled={disabled}
        />
    );
}
