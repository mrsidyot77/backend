import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            index: true,
            trim: true
        },
        email: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            index: true,
            trim: true
        },
        avatar: {
            type:String, // cloudnary url
            required: true
        },
        coverImage: {
            type:String, // cloudnary url
        },
        watchHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
        }],
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next() // negative check if password is not modified this code wont work
    this.password = await bcrypt.hash(this.password,10) 
    next()
}) //middlleware hooks (pre) is use to execute before data is saved

userSchema.methods.isPasswodCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
 
} // custom hook to check the hash password

userSchema.methods.generateAccessToken = function () {
    return jwt.sign( // it is a function to create a json webtoken
        {
            _id:this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign( // it is a function to create a json webtoken
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema)