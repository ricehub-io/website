interface Props {
    label: string;
    htmlFor?: string;
}

export default function FormLabel({ label, htmlFor }: Props) {
    return (
        <label
            className="mb-0.5 block text-base font-medium sm:text-lg"
            htmlFor={htmlFor}
        >
            {label}
        </label>
    );
}
