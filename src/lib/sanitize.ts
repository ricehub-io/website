import DOMPurify, { Config } from "dompurify";
import { marked } from "marked";

const sanitizeConfig: Config = {
    ALLOWED_TAGS: [
        "a",
        "b",
        "i",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "code",
        "hr",
        "s",
    ],
    ALLOWED_ATTR: ["href", "target", "title", "class"],
};

// force links to contain target="_blank" so they open in new tabs :3
marked.use({
    renderer: {
        link({ href, text, title }) {
            return `<a href="${href}" title="${title}" target="_blank" rel="noreferrer noopener">${text}</a>`;
        },
    },
});

/** Sanitizes input and allows only specific tags, then parses the input as markdown and returns HTML */
export function sanitizeMarkdownInput(input: string): string {
    const rawHTML = marked.parse(input, { async: false });
    return DOMPurify.sanitize(rawHTML, sanitizeConfig);
}
