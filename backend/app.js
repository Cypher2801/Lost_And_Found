import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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
import lostItemsRoutes from "./src/routes/lost_items.routes.js";


app.use("/api/user", userRoutes)
app.use("/api/lost-items", lostItemsRoutes)

export default app;
