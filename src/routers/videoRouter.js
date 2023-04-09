import express from "express";
import { getEdit,watch,postEdit,getUpload,postUpload,deleteVideo } from "../controller/videoController";
import { userProtectMiddleware, uploadVideo } from "../middlewares"

const videoRouter = express.Router();


videoRouter.get("/:id([0-9a-f]{24})", watch)
videoRouter.route("/:id([0-9a-f]{24})/edit").all(userProtectMiddleware).get(getEdit).post(postEdit)
videoRouter.get("/:id([0-9a-f]{24})/delete",userProtectMiddleware, deleteVideo);
videoRouter
    .route("/upload")
    .all(userProtectMiddleware)
    .get(getUpload)
    .post(
        uploadVideo.fields([{ name: "video" }, { name: "thumbnail" }]),
        postUpload
    );

export default videoRouter;