import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import router from "./router";
import {setupReactViews} from "express-tsx-views";
import {setupPassport} from "./passport";
import helmet from "helmet";

const server = express();

// view engine
setupReactViews(server, {
    viewsDirectory: "views",
});

// middleware
server.use(helmet.hsts());
server.disable("x-powered-by");
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
