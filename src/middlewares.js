import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client }  from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

const multerUploder = multerS3({
    s3: s3,
    bucket: "ho-tube",
    acl: "public-read",
});

export const middleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.user = req.session.user || {};
    next();
};

export const userProtectMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Log in first.");
        return res.redirect("/login");
    }
};

export const publicMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};

export const uploadAvatar = multer({
    dest: "uploads/avatar",
    limits: { filesize: 30000 },
    storage: multerUploder,
});
export const uploadVideo = multer({
    dest: "uploads/videos",
    limits: { filesize: 100000 },
    storage: multerUploder,
});