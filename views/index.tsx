// @ts-ignore
import React, {Component, ReactElement} from "react";
import User from "../src/models/User";

export interface Props {
    title?: string,
    css?: string[],
    user: typeof User
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

    const logInOutEl = props.user ?
        <a href="/logout">Logout</a> :
        <a href="/auth/google">Google Login</a>

    return (
        <html>
            <head>
                <title>{title}</title>

                {cssLinks}
                <script src="https://unpkg.com/htmx.org@1.9.2"></script>
            </head>
            <body>
                <nav>
                    <ul>
                        <li>{logInOutEl}</li>
                    </ul>
                </nav>
                <h1>{props.title}</h1>
                <form method="POST" encType="multipart/form-data" action="/upload">
                    <input type="file" name="Files" multiple/>
                    <button>
                        Upload
                    </button>
                </form>

            </body>

        </html>

    );
}

export default render;
