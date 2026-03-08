import "./env"

import express from "express"
import cors from "cors"
import { middleware } from "./middleware";
import authRouter from "./routes/auth";
import roomRouter from "./routes/room";

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/rooms", middleware, roomRouter);

app.listen(3001, () => {
    console.log("HTTP server started on 3001")
})
