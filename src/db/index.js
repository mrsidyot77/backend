import mongoose from "mongoose";
import { DB_NAME } from "../constans.js";

const  connectDB = async () =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB CONNECTED !! DB HOST: ${connectionInstance.connection.host}`);//just to know on which host db is connected
        
    } catch (error) {
        console.log("Mongo DB Connection Failed: ",error);
        process.exit(1) 
        
    }
}

export default connectDB