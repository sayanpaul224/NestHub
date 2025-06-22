import mongoose from "mongoose";
import PostModel from "./post_model.js";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        
    },
    email: {
        type: String,
    },
    posts:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Post",
        default: [],
    },
    whatsapp: {
        type: String,
    },
    phone: {
        type: String,
    },
    otp: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;