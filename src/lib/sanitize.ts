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
        "pre",
        "br",
        "code",
        "hr",
        "s",
        "blockquote",
        "strong",
        "p",
        "kbd",
        "em",
    ],
    ALLOWED_ATTR: ["href", "target", "title", "class", "rel"],
};

// force links to contain target="_blank" so they open in new tabs :3
marked.use({
    renderer: {
        link({ href, text, title }) {
            return `<a href="${href}" ${title !== undefined && title !== null && `title="${title}"`} target="_blank" rel="noreferrer noopener">${text}</a>`;
        },
    },
});

/** Sanitizes input and allows only specific tags, then parses the input as markdown and returns HTML */
export function sanitizeMarkdownInput(input: string): string {
    // replace literal "\n" with actual new lines
    const markdownText = input.replace(/\\n/g, "\n");

    // parse markdown to HTML
    const rawHTML = marked.parse(markdownText, { async: false });

    // sanitize HTML so it cant be exploited >:(
    const sanitized = DOMPurify.sanitize(rawHTML, sanitizeConfig);

    return sanitized;
}
