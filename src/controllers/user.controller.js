import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res)=>{
    // THESE ARE ALGORITHMS TO CREATE/REGISTER USER


    // get user from frontEnd
    // validation - not empty
    // user already exist- check wiith email or username
    // check for images, avatar -- cover image will be optional
    // upload them on the cloudinary and get the link as a string to store it into db
    // create user object - create entry in db
    // remove password and refresh token from the response
    // check for user creation 
    // return res


    const {fullName, email, username , password} = req.body //getting data from frontendjson response and form data will be store in the req.body
    console.log("email: ",email,",fullName: ",fullName);
    
    if (
        [fullName,email,username,password].some((field) => 
        field.trim() === "") //some will go to each field and trim it if still there is empty string it will return true
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser =  User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with email and username is already exists.");
        
    }

    const avatarLocalPath = req.files?.avatar[0]?.path //this will give you localPath. It is like req.body but here we are using middleware multer so it gives you access of files go and chek middleware multer.middleware.js and user.routes.js

    //same with coverImage
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    
    }

    //insert query like create method to insert record in mongo db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser  = await User.findById(user._id).select(
        "-password -refreshedToken"
    ) //string field will be removed from the response

    if (!createdUser) {
        throw new ApiError(500 , "something went wrong while registering a user.")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully.")
    )
})

export {registerUser}