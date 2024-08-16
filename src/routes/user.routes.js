import { Router } from "express";
import { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPasssword, 
    getCurrentUser, 
    updateAccountDetails,
    updateUserAvatar, 
    updateUserCoverImage,
    getUserChannelProfile 
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([ //middleware injection
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured route

router.route("/logout").post(verifyJWT,logoutUser) //verifyJWT is middeleware and next will be logout
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPasssword)
router.route("/current-user").post(verifyJWT,getCurrentUser)
router.route("/update-account").post(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

export default router;