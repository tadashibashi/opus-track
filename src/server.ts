import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import router from "./router";
import {setupPassport} from "./passport";
import helmet from "helmet";

const server = express();

// view engine
server.set("view engine", "ejs");
server.set("views", "views");

// middleware
server.use(helmet({
    contentSecurityPolicy: {
        useDefaults: false,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "google.com",
                "kit.fontawesome.com"],
            objectSrc: ["'none'"],
            styleSrc: ["'self'"],
            connectSrc: ["'self'", "accounts.google.com"],
        }
    },
    noSniff: true,
    hidePoweredBy: true,
    xXssProtection: true,
    strictTransportSecurity: false,
}));

server.use(morgan("dev"));
setupPassport(server);
server.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use(express.static("public"));

// routes
server.use("/", router);

export default server;
