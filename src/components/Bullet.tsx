import { HTMLAttributes } from "preact/compat";

export default function Bullet(props: HTMLAttributes<HTMLSpanElement>) {
    return (
        <span className="text-foreground/20 mx-2" {...props}>
            &#9679;
        </span>
    );
}
