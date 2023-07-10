// @ts-ignore
import React, {Component, ReactElement} from "react";

export interface Props {
    title?: string,
    css?: string[],
}

function render(props: Props) {
    const cssLinks: ReactElement[] = [];
    if (props.css) {
        props.css.forEach((link, i) => {
            cssLinks.push(
                <link rel="stylesheet" href={link} key={"css-link-" + i} />
            );
        });
    }

    const title = `Opus Track${props.title ? ": " + props.title : ""}`;

    return (
        <html>
            <head>
                <title>{title}</title>

                {cssLinks}
                <script src="https://unpkg.com/htmx.org@1.9.2"></script>
            </head>
            <body>
                <h1>{props.title}</h1>

                <button hx-post="/clicked" hx-swap="outerHTML">
                    Click Me
                </button>
            </body>

        </html>

    );
}

export default render;
