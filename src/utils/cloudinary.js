import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // cloudinary credintials
    });

    const uploadOnCloudinary = async (localFilePath)=>{
        try {
            if(!localFilePath) return null
            //uploadTheFile on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto" 
                
            })//type of the file video or image
            //file has been uploaded successfully
            // console.log("file has been uploaded successfuly on cloudinary ",response.url);
            fs.unlinkSync(localFilePath)
            return response
                
        } catch (error) {
            fs.unlinkSync(localFilePath)
            return null;//remove the locally saved temp file as the uploaded operation failed
        }
    }

    export {uploadOnCloudinary}