/**
 * Pages Engine: built on top of ejs view engine
 * Under the hood a call to {@link render} calls
 * `res.render` and finds all the corresponding
 * files to generate the template page html
 *
 * How to use:
 * 1. initialize once with {@link init}
 * 2. render pages with {@link render}
 *
 * These files will autoload during a page render
 */

import passport from "passport";
import {Request, Response} from "express";
import fs from "fs";
import path from "path";

// When specifying a partial the data to retrieve
interface PartialInfo {
    partial: string;
    locals: any;
}

// Local variables passed to driver.ejs file
interface DriverLocals<T extends object> {
    title?: string;
    subtitle?: string;
    header?: PartialInfo;
    footer?: PartialInfo;
    main?: PartialInfo;
    user?: passport.Profile;
    css?: string[];
    scripts?: string[];
    locals?: T;
}

// Local variables passed into the actual page and all child partials.
// user is combined into locals into one object during render.
interface PageLocals<T extends object> {
    locals?: T;
    user: passport.Profile;
}

// User options for page rendering.
export interface PageOptions<T extends object> {
    // override the page <title> tag if set
    title?: string;
    // appended after the title after a semicolon `<title>: <subtitle>` if set, otherwise
    // it will just be the title without semicolon.
    subtitle?: string;
    // prevents header in current page. default: `false`
    omitHeader?: boolean;
    // prevents footer in current page. default: `false`
    omitFooter?: boolean;
    // add additional script files to the page relative from `/scripts` folder
    scripts?: string[];
    // add additional css files to the page relative from `/styles` folder.
    css?: string[];
    // any local variables for all to have access to
    locals?: T;
}

let engine: PageEngine | null = null;

/**
 * Initialize the page engine with a default app title name. Only needed to be called once
 * before any calls to render.
 * @param appTitle - automatically gets set in `<title>` tag, unless overridden in render options.
 */
export function init(appTitle: string) {
    if (!engine) {
        engine = new PageEngine(appTitle);
    }
}

/**
 * Renders a page
 * @param page - page name. There should be corresponding ejs file in `views/pages/<page>`.
 * Automatic load, if a file exists at these locations:
 * - script at: `public/scripts/pages/<page>.js`
 * - css at: `public/css/pages/<page>.css`
 * @param req - express request object
 * @param res - express response object
 * @param opts - optional options
 */
export function render<T extends object>(page: string, req: Request, res: Response, opts?: PageOptions<T>) {
    if (!engine) {
        throw ReferenceError("Tried to call page.render, but PageEngine was not inititalized. " +
            "Did you make sure to call page.init?");
    }

    engine.render(page, req, res, opts);
}

/**
 * Page engine object. Currently only stores the default title.
 * Made for extensibility moving forward.
 */
class PageEngine {
    defaultTitle: string;

    constructor(title: string) {
        this.defaultTitle = title;
    }

    render<T extends object>(page: string, req: Request, res: Response, opts?: PageOptions<T>) {
        if (!fs.existsSync(path.join(process.cwd(), "views/pages/" + page + ".ejs")))
            if (fs.existsSync(path.join(process.cwd(), "views/pages/" + page + "/index.ejs"))) {
                page += "/index";
            } else {
                throw ReferenceError("Attempted to render page: " + page +
                    ", but no correlating view at \"" + "/views/pages/" + page +
                    ".ejs\" or \"/views/pages/" + page + "/index.ejs\" exists.");
            }

        const vars: DriverLocals<T> = {};
        const locals: PageLocals<T> = {
            user: req.user,
            locals: opts?.locals,
        };

        const showHeader = !(opts?.omitHeader);
        const showFooter = !(opts?.omitFooter);

        const preppedLocals = Object.assign(locals.locals || {}, {user: locals.user});

        if (showHeader) {
            vars.header = {
                partial: "partials/header",
                locals: preppedLocals,
            }
        }

        if (showFooter) {
            vars.footer = {
                partial: "partials/footer",
                locals: preppedLocals,
            }
        }

        vars.scripts = [];
        if (fs.existsSync(path.join(__dirname, "../public/scripts/pages/" + page + ".js")))
            vars.scripts.push("/scripts/pages/" + page + ".js");

        if (opts?.scripts)
            opts.scripts.forEach(scriptFile => vars.scripts!.push(scriptFile));

        vars.css = [];
        if (fs.existsSync(path.join(__dirname, "../public/styles/pages/" + page + ".css")))
            vars.css.push("/styles/pages/" + page + ".css");
        if (opts?.css)
            opts.css.forEach(styleFile => vars.css!.push(styleFile));

        vars.title = opts?.title || this.defaultTitle;
        vars.subtitle = opts?.subtitle;
        vars.main = {
           partial: "pages/" + page,
           locals: preppedLocals,
        };

        res.locals.vars = vars;
        res.render("driver");
    }
}
