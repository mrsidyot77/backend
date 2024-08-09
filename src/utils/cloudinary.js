import {v2 as cloudinary} from 'cloudinary'
import fs from "fs"



    // Configuration
    cloudinary.config({ 
        cloud_name: process_params.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process_params.env.CLOUDINARY_API_KEY, 
        api_secret: process_params.env.CLOUDINARY_API_SECRET // cloudinary credintials
    });

    const uploadOnCloudinary = async (localPath)=>{
        try {
            if(!localPath) return null
            //uploadTheFile on cloudinary
            const response = await cloudinary.uploader.upload(localPath,{
                resource_type:"auto" //type of the file video or image
                //file has been uploaded successfully
                
            })
            console.log("file has been uploaded successfuly on cloudinary ",response.url);
            return response
                
        } catch (error) {
            fs.unlinkSync(localPath)//remove the locally saved temp file as the uploaded operation failed
        }
    }

    export {uploadOnCloudinary}