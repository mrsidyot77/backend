import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken //user have the user details so, user.refreshToken field will add the generated refreshToken
        await user.save({validateBeforeSave: false}) //db operation to save the field 

        return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refersh tokens")
    }
}

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
    // console.log("email: ",email,",fullName: ",fullName);
    
    if (
        [fullName,email,username,password].some((field) => 
        field.trim() === "") //some will go to each field and trim it if still there is empty string it will return true
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with email and username is already exists.");
        
    }

    const avatarLocalPath = req.files?.avatar[0]?.path; //this will give you localPath. It is like req.body but here we are using middleware multer so it gives you access of files go and chek middleware multer.middleware.js and user.routes.js
    // console.log(req.files)


    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed")
    
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

const loginUser = asyncHandler(async (req,res)=>{
    // take the data from frotEnd
    // varify email or username
    // find the user // query
    // check passwword
    // create access and refresh token
    // send this token in secured coockies
    // send the respone

    const {email, username , password} = req.body

    if(!username && !email){
        throw new ApiError(400, "Username or password required.");
        
    }

    const user = await User.findOne({ //select query
        $or: [{email},{username}] //("$or") mongo db operator
    })

    if (!user) {
        throw new ApiError(404, "Email or Username does not exist.")
    }

    const isPasswordValid = await user.isPasswodCorrect(password) // isPasswodCorrect this method is called from user.model to validate the user s password

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user's credintials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id) //user._id comes from above selected query for this method check this file on the top

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }// option is the cookie parser opject which plays security part here these cookcies will only be modifies by server and db. 

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
        {
            user: loggedInUser, refreshToken, accessToken
        },
        "User Logged in Successfully"
    )
    )

})

const logoutUser = asyncHandler(async  (req,res)=>{
    // clear coockies and refreshToken must be reset
    await User.findByIdAndUpdate(
        req.user._id,{
            $set: { //mongodb opeartion to update field in db
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        // The options object is used to configure the behavior of cookies 
        // when they are set or cleared in the user's browser. The options
        // provided below are commonly used to enhance the security of cookies.
    
        httpOnly: true,  // This option makes the cookie inaccessible to JavaScript
                         // running in the browser, protecting against XSS attacks.
        
        secure: true     // This option ensures that the cookie is only sent over
                         // secure (HTTPS) connections, protecting it from being
                         // intercepted during transmission.
    }
    
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged out successfuly."))
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.coockies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError (401, "Unauthorized request.")
    }

try {
        const decodedToken = jwt.verify(
            incomingRefreshToken ,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError (401, "Invalid refresh Token.")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh Token is expired or used.")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status (200)
        .cookie("accessToken",accessToken,options) 
        .cookie("refreshToken",newRefreshToken,options) 
        .json(
            new ApiResponse(
                200,
                {accessToken,
                refreshToken: newRefreshToken},
                "Access token refreshed."
            )
        )
} catch (error) {
    throw new ApiError(401,error?.message ||  "Invalid reshres token")
}
})

const changeCurrentPasssword = asyncHandler(async(req,res)=>{

    const {oldPassword,newPassword,confPassword} = req.body

    if (!(newPassword === confPassword)) {
        new ApiError (400,"New password and Confirm Password must be match.")
    }

    const user = await user.findById(req.user?._id)//auth midleware we will get the user id
    const isPasswordCorrect = await user.isPasswodCorrect(oldPassword) //isPasswodCorrect is a method that comes from user model
    
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Old password is Invalid")
    }

    user.passwrod = newPassword //it will set the new password in db with hash and modify only password using below line. 
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password changed successfully"))
})

const getCurrentUSer = asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(200, req.user, "Current user fetched successfully.")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email} = req.body

    if (!email && !fullName) {
        throw new ApiError(401, "Email or Full Name is required.")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email
            }
        },
        {
            new: true//this obj will return the data after updtation
        }
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar:avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse (200,user,"Avatar updated successfully.")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading Cover Image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse (200,user,"Cover Image updated successfully."))
})

export {
    registerUser,
    loginUser,
    logoutUser, 
    refreshAccessToken,
    changeCurrentPasssword,
    getCurrentUSer,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}