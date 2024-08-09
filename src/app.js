import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credential: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//import routea
import userRouter from './routes/user.routes.js';

//routes declaraation
app.use("/api/v1/users",userRouter)
//create route means url
//httos://localhost:4000"/api/v1/users like this


export {app}