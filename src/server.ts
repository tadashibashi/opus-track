import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import methodOverride from "./middleware/methodOverride";
import router from "./router";


const server = express();

// view engine
server.set("view engine", "ejs");
server.set("views", "views");

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
