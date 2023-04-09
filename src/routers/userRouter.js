import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  githubLogin,
  githubCallback,
  getChangePassword,
  postChangePassword,
  userProfile,
} from "../controller/userController"
import {
  userProtectMiddleware,
  publicMiddleware,
  uploadAvatar,
} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", userProtectMiddleware,logout);
userRouter.get("/github/login", publicMiddleware, githubLogin);
userRouter
  .route("/change-password")
  .all(userProtectMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/callback",publicMiddleware, githubCallback);
userRouter
  .route("/edit")
  .all(userProtectMiddleware)
  .get(getEdit)
  .post(uploadAvatar.single("avatar"), postEdit);

userRouter.get("/:id([0-9a-f]{24})", userProfile);




export default userRouter;