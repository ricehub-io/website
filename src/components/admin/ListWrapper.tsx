import { ComponentChildren } from "preact";
import { RadioButton, RadioButtonProps } from "../RadioButton";

interface ListWrapperProps {
    label: string;
    buttons: RadioButtonProps[];
    children: ComponentChildren;
}

export default function ListWrapper({
    label,
    buttons,
    children,
}: ListWrapperProps) {
    return (
        <div className="bg-bright-background rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-bold">{label}</p>
                <div>
                    {buttons.map((props) => (
                        <RadioButton key={props.value} {...props} />
                    ))}
                </div>
            </div>
            <div className="flex flex-col gap-4">{children}</div>
        </div>
    );
}
