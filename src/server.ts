import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import router from "./router";
import {setupReactViews} from "express-tsx-views";
import passport from "passport";

const server = express();

// view engine
setupReactViews(server, {
    viewsDirectory: "views",
});

// middleware
server.use(morgan("dev"));
server.use(session({
    secret: process.env["SESSION_SECRET"] as string,
    resave: false,
    saveUninitialized: true,
}));
server.use(passport.initialize());
server.use(passport.session());
server.use(express.json());
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use(express.static("public"));

// routes
server.use("/", router);

export default server;
