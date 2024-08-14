//it will verify if user exist or not or logged in or not 

import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"


export const verifyJWT = asyncHandler(async(req,res,next)=>{//req have coockies access so it will have access of token // how req have access of coockies => you have given the access by using middleware in app.js => app.use("coockieParser()") line 

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","") //this will access the token and make it empty when we call this function
    
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
    
        }
    
        const decoedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decoedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401,"Invalid access Token");
        
    }
})