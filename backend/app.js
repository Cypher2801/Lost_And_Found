import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from './src/db/index.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}));

app.use(express.json({limit : "16kb"}))
app.use(urlencoded({limit : "16kb" , extended : true}))
app.use(express.static("public"));
app.use(cookieParser())


//importing routes
import userRoutes from "./src/routes/user.route.js";

app.use("/api/user", userRoutes)
export default app;
