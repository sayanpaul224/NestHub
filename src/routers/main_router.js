import { Router } from "express";
import { UserController } from "../controllers/main_controller.js";
import {getNearbyPosts,getPostByPincode,getPostByAddress} from "../controllers/ranking_controller.js";
import {uploadImages, handleImageUpload} from "../controllers/upload_imges_controller.js";

const router = Router();

router.post("/api/v1/create-user", UserController.createUser);
router.post("/api/v1/update-user/:id", UserController.updateUser);
// postData
router.post("/api/v1/post-data/:userId", UserController.postData);
router.get("/api/v1/get-nearby-posts/", getNearbyPosts);
router.post("/api/v1/send-otp", UserController.sendOtp);
router.post("/api/v1/upload-images", uploadImages, handleImageUpload);
router.post("/api/v1/toggle-post-status/:id", UserController.togglePostStatus);
// getMyPosts
router.get("/api/v1/get-my-posts/:userId", UserController.getMyPosts);
//getPostByPincode
router.get("/api/v1/get-post-by-pincode/:pincode", getPostByPincode);

router.get("/api/v1/get-post-by-add/:keyword", getPostByAddress);



export default router;
