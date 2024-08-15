import mongoose,{Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: { //One who is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: { //One whome "subscriber" is subscribing
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps:true})

export const Subdcription = mongoose.model("Subscription", subscriptionSchema)