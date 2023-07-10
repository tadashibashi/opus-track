import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import methodOverride from "./middleware/methodOverride";
import router from "./router";
import {setupReactViews} from "express-tsx-views";

const server = express();

// view engine
setupReactViews(server, {
    viewsDirectory: "views",
});

// middleware
server.use(methodOverride("_method"));
server.use(morgan("dev"));
server.use(express.json())
server.use(express.urlencoded({extended: false}));
server.use(cookieParser());
server.use(express.static("public"));

// routes
server.use("/", router);

export default server;
