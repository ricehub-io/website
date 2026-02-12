import FormLabel from "./FormLabel";

interface Props {
    name: string;
    label: string;
    value?: string;
}

export default function FormTextArea({ name, label, value }: Props) {
    return (
        <div>
            <FormLabel label={label} htmlFor={name} />
            <textarea
                className="bg-bright-background rounded-md w-full outline-none px-6 py-4 text-lg focus:bg-gray/30 transition-[background-color] duration-300"
                name={name}
                id={name}
                rows={15}
                required
                value={value}
            />
        </div>
    );
}
