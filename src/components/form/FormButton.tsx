interface FormButtonProps {
    label: string;
    type: "submit" | "reset";
    disabled?: boolean;
    className?: string;
}

export function FormButton({
    label,
    type,
    disabled,
    className,
}: FormButtonProps) {
    return (
        <input
            className={`bg-bright-background hover:bg-gray/30 hover:text-foreground/80 disabled:text-gray disabled:bg-bright-background/50 w-full rounded-md py-3 text-base font-medium transition-colors duration-300 hover:cursor-pointer disabled:cursor-not-allowed sm:text-lg md:text-xl ${className}`}
            type={type}
            value={label}
            disabled={disabled}
        />
    );
}
