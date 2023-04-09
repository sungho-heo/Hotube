import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/apiRouter";
import { middleware } from "./middlewares";

const app = express();

const loggerMorgan = morgan("dev");

app.set("views", process.cwd() + "/src/views")
app.set("view engine", "pug");
app.use(loggerMorgan); // logger는 사용자가 어떤 페이지를 향하며 http method를 어떤걸 하는지 확인하기 위함.
app.use(express.urlencoded({ extended: true })); //pug의 body데이터 받아오기위해서 필요한 작업임.
app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    })
);
app.use(middleware);
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use(flash());
app.use("/", rootRouter); // home url router의 /안의 또다른 url router를 찾음 동일하면 그 해당하는 url페이지를 보여줌
app.use("/users", userRouter); // userrouter 안에 있는 url router를 찾음 해당하는 페이지를 찾으면 그 해당하는 페이지를 보여줌.
app.use("/videos", videoRouter);
app.use("/api", apiRouter);
export default app;