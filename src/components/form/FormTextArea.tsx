import FormLabel from "./FormLabel";

interface Props {
    name: string;
    label: string;
}

export default function FormTextArea({ name, label }: Props) {
    return (
        <div>
            <FormLabel label={label} htmlFor={name} />
            <textarea
                className="bg-bright-background rounded-md w-full outline-none px-6 py-4 text-lg"
                name={name}
                id={name}
                rows={15}
            />
        </div>
    );
}
