// require('dotenv').config({path: './env'})

import dotenv from "dotenv";

import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./.env" });

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙ Servr is running at PORT: ${process.env.PORT}`);
      app.on("error", (error) => {
        console.log("ERROR: db not able to listen express", error);
      });
    });
  })
  .catch((error) => {
    console.log("Mongo DB Connection failed !!!! ", error);
  });

/*import express from "express";

const app = express()

( async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error",(error)=>{ //express part 
        console.log("ERROR: db not able to talk with express",error);
        throw error;
        
       })
       app.listen(process.env.PORT),()=>{
            console.log(`App is listening on Port: ${process.env.PORT }`);
            
       }
    } catch (error) {
        console.log("Error",error);
        
    }
})()*/
