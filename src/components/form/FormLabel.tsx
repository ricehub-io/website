interface Props {
    label: string;
    htmlFor?: string;
}

export default function FormLabel({ label, htmlFor }: Props) {
    return (
        <label className="block text-xl" htmlFor={htmlFor}>
            {label}
        </label>
    );
}
