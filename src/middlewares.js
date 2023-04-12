import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

const s3 = new S3Client({
    region: "ap-northeast-2",
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    },
});

export const imageDelete = async (req, res, next) => {
    console.log(req.file);
    if (!req.file) {
        console.log(req.file);
        return next();
    }
    const key = `avatars/${req.session.user.avatarUrl.split('/')[4]}`;
    const bucketParams = { Bucket: "ho-tube", Key: key };
    try {
        const data = await s3.send(new DeleteObjectCommand(bucketParams));
        console.log("Success. Avatar deleted", data);
    } catch (error) {
        console.log("Error", error);
        return res.redirect("/users/edit");
    };
    next();
}

const s3ImageUploder = multerS3({
    s3: s3,
    bucket: "ho-tube",
    acl: "public-read",
    key: function (req, file, cb) {
        const newFileName = Date.now() + "-" + file.originalname
        const fullPath = "avatars/" + newFileName
        cb(null, fullPath)
    },
});

const s3VideoUploder = multerS3({
    s3: s3,
    bucket: "ho-tube",
    acl: "public-read",
    key: function (req, file, cb) {
        const newFileName = Date.now() + "-" + file.originalname
        const fullPath = "videos/" + newFileName
        cb(null, fullPath)
    },
});

const isHeroku = process.env.NODE_ENV === "production";

export const middleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.user = req.session.user || {};
    res.locals.isHeroku = isHeroku;
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
  dest: "uploads/avatars/",
  limits: { filesize: 30000 },
  storage: isHeroku ? s3ImageUploder : undefined,
})

export const uploadVideo = multer({
  dest: "uploads/videos/",
  limits: { filesize: 100000 },
  storage: isHeroku ? s3VideoUploder : undefined,
})