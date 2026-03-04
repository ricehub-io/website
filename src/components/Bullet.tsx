import { HTMLAttributes } from "preact/compat";

export default function Bullet({
    className,
    ...props
}: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span className={`text-foreground/20 mx-2 ${className}`} {...props}>
            &#9679;
        </span>
    );
}
