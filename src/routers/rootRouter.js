import express from "express";
import {homeVideo,search} from "../controller/videoController";
import {
    getJoin,
    postJoin,
    getLogin,
    postLogin,
} from "../controller/userController";
import { publicMiddleware } from "../middlewares";

const rootRouter = express.Router();

rootRouter.get("/", homeVideo);
rootRouter.route("/join").all(publicMiddleware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(publicMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/search", search);


export default rootRouter;
