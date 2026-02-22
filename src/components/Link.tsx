import { ComponentChildren } from "preact";
import { JSX } from "preact/jsx-runtime";

export interface LinkProps extends JSX.AnchorHTMLAttributes {
    content: string | ComponentChildren;
    url: string;
    /** should the link be opened in new or current tab */
    inNewTab?: boolean;
}

export default function Link({ content, url, inNewTab, ...props }: LinkProps) {
    return (
        <a
            className="text-blue underline decoration-wavy transition-colors hover:text-blue/80"
            href={url}
            target={inNewTab ? "_blank" : "_self"}
            {...props}
        >
            {content}
        </a>
    );
}
