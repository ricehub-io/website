interface FormButtonProps {
    label: string;
    type: "submit" | "reset";
}

export function FormButton({ label, type }: FormButtonProps) {
    return (
        <input
            className="w-full bg-bright-background py-3 rounded-md transition-colors duration-300 hover:cursor-pointer hover:bg-gray/30"
            type={type}
            value={label}
        />
    );
}
