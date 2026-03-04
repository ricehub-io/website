import { ComponentChildren } from "preact";
import { AnchorHTMLAttributes } from "preact/compat";

export interface LinkProps extends AnchorHTMLAttributes {
    content: string | ComponentChildren;
    url: string;
    /** should the link be opened in new or current tab */
    inNewTab?: boolean;
}

export default function Link({ content, url, inNewTab, ...props }: LinkProps) {
    return (
        <a
            className="text-blue hover:text-blue/80 underline transition-colors"
            href={url}
            target={inNewTab ? "_blank" : "_self"}
            {...props}
        >
            {content}
        </a>
    );
}
