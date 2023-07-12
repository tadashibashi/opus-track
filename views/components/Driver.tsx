// @ts-ignore
import React from "react";

const APP_TITLE = "Opus Tracks";

interface DriverProps {
    title?: string;
}

function Driver(props: DriverProps) {
    const title = `${APP_TITLE}${props.title ? ": " + props.title : ""}`;

    return (
        <html>
            <head>
                <title></title>
            </head>

            <body>

            </body>
        </html>
    );
}
