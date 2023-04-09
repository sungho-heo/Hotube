import multer from "multer";
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

export const uploadAvatar = multer({ dest: "uploads/avatar", limits: {filesize: 30000} });
export const uploadVideo = multer({
    dest: "uploads/videos",
    limits: { filesize: 100000 },
});