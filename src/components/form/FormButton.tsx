interface FormButtonProps {
    label: string;
    type: "submit" | "reset";
    disabled?: boolean;
}

export function FormButton({ label, type, disabled }: FormButtonProps) {
    return (
        <input
            className="w-full mt-2 font-bold text-xl bg-bright-background py-3 rounded-md transition-colors duration-300 hover:cursor-pointer hover:bg-gray/30 disabled:cursor-not-allowed disabled:text-gray disabled:bg-bright-background/50"
            type={type}
            value={label}
            disabled={disabled}
        />
    );
}
