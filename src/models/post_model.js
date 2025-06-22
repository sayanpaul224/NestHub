import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        default: "",
    },
    email: {  
        type: String,
        default: "",
    },
    userId: {
        type:String
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "User",
        // required: true,
    },
    phone: {
        type: String,
        default: "",
    },
    content: {
        type: String,
        default: "",
    },
    rooms: {
        type: Number,
        default: 0,
    },
    bathrooms: {
        type: Number,
        default: 0,
    },
    size: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    latitude: {
        type: Number,
        default: 0,
    },
    longitude: {
        type: Number,
        default: 0,
    },
    image: {
        type: [String],
        default: [],
    },
    city: {
        type: String,
        default: "",
    },
    postalCode: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["live", "closed"],
        default: "live",
    },
    },{timestamps: true,}
);

const PostModel = mongoose.model("Post", postSchema);

export default PostModel;