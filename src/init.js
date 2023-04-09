import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server.js";

const PORT = process.env.PORT || 4000;


const handleAppListen = () => console.log(`good app:http://localhost:${PORT}/`);

app.listen(PORT, handleAppListen);
