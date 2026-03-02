import { useSignal } from "@preact/signals";
import FormLabel from "./FormLabel";
import {
    ChangeEvent,
    TargetedEvent,
    TextareaHTMLAttributes,
    useEffect,
    useRef,
} from "preact/compat";

interface FormTextAreaProps extends TextareaHTMLAttributes {
    name: string;
    label?: string;
    value?: string;
}

export default function FormTextArea({
    name,
    label,
    value,
    onKeyDown,
    ...props
}: FormTextAreaProps) {
    const ref = useRef<HTMLTextAreaElement>();
    const valueSignal = useSignal(value ?? "");

    useEffect(() => {
        if (ref.current) {
            valueSignal.value = ref.current.value;
        }
    }, []);
    // useEffect(() => {
    //     valueSignal.value = value;
    // }, [value]);

    // add 4 spaces when pressing tab
    const keyDown = (e: TargetedEvent<HTMLTextAreaElement, KeyboardEvent>) => {
        if (e.key === "Tab") {
            e.preventDefault();

            const textArea = e.currentTarget;
            const { selectionStart, selectionEnd, value } = textArea;
            // const value = valueSignal.value;

            const valueWithTab =
                value.slice(0, selectionStart) +
                "    " +
                value.slice(selectionEnd);

            valueSignal.value = valueWithTab;

            // wait for DOM update before setting cursor
            requestAnimationFrame(() => {
                textArea.setSelectionRange(
                    selectionStart + 4,
                    selectionStart + 4
                );
            });
        }

        onKeyDown?.(e);
    };

    return (
        <div>
            {label !== undefined && <FormLabel label={label} htmlFor={name} />}
            <textarea
                {...props}
                ref={ref}
                name={name}
                id={name}
                value={valueSignal}
                rows={props.rows ?? 15}
                required
                className={`bg-bright-background focus:bg-gray/30 w-full rounded-md px-3 py-2 text-sm transition-[background-color] duration-300 outline-none sm:px-4 sm:text-base md:text-lg ${props.className}`}
                onKeyDown={keyDown}
            />
        </div>
    );
}
