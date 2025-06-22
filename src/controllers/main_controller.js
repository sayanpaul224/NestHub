
import UserModel from "../models/user_model.js";
import PostModel from "../models/post_model.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import sendOTPEmail from "../utils/otp_util.js";


export const UserController = {
  // res.json({ success: true, message: "OTP verified successfully.", user: { name: "John Doe", email: "john@example.com" } });

  sendOtp: async (req, res) => {
    const { email } = req.body;

    try {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      console.log("OTP:", otp);
      sendOTPEmail(email, otp);
      let user = await UserModel.findOne({ email });

      if (!user) {
        user = new UserModel({ email });
      }

      user.otp = otp;
      user.otpExpires = expiry;
      await user.save();

      // TODO: send OTP to email or SMS using nodemailer/twilio/etc.

      res.json({ success: true, message: "OTP sent" });
    } catch (error) {
      res.json({ success: false, message: "Something Went Wrong!" });
    }
  },

  createUser: async (req, res) => {
    const { email, otp, name } = req.body;

    try {
      const user = await UserModel.findOne({ email });

      if (!user || user.otp !== otp || user.otpExpires < new Date()) {
        return res.json({ success: false, message: "Invalid or expired OTP" });
      }

      // Clear OTP after verification
      user.otp = undefined;
      user.otpExpires = undefined;
      user.name = name;
      await user.save();

      res.json({
        success: true,
        message: "OTP verified",
        user: { email: user.email, name: user.name, id: user._id },
      });
    } catch (error) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }
  },

  //  createUser : async (req, res) => {
  //     const { email, password, name } = req.body;

  //     try {
  //         if (!email || !password) {
  //             return res.status(400).json({ success: false, msg: "Email and password are required" });
  //         }

  //         let user = await UserModel.findOne({ email });

  //         if (user) {
  //             const isMatch = await bcrypt.compare(password, user.password);
  //             if (!isMatch) {
  //                 return res.status(401).json({ success: false, msg: "Invalid credentials" });
  //             }
  //         } else {
  //             if (!name) {
  //                 return res.status(400).json({ success: false, msg: "Name is required for new users" });
  //             }

  //             const hashedPassword = await bcrypt.hash(password, 10);
  //             user = await UserModel.create({
  //                 email,
  //                 password: hashedPassword,
  //                 name
  //             });
  //         }

  //         const token = jwt.sign(
  //             { userId: user._id },
  //             process.env.JWT_SECRET,
  //             { expiresIn: '1h' }
  //         );

  //         const userData = {
  //             id: user._id,
  //             name: user.name,
  //             email: user.email
  //         };

  //         return res.status(200).json({
  //             success: true,
  //             token,
  //             user: userData,
  //             msg: user ? "Login successful" : "Account created successfully"
  //         });

  //     } catch (error) {
  //         console.error("Error:", error);
  //         return res.status(500).json({ success: false, msg: "Server error", error: error.message });
  //     }
  // },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, msg: "Invalid user ID" });
      }

      delete updateData.email;
      delete updateData.password;

      const updatedUser = await UserModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password -__v");

      if (!updatedUser) {
        return res.status(404).json({ success: false, msg: "User not found" });
      }

      return res.status(200).json({
        success: true,
        user: updatedUser,
        msg: "User updated successfully",
      });
    } catch (error) {
      console.error("Update error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          msg: "Validation failed",
          errors: error.errors,
        });
      }

      return res.status(500).json({
        success: false,
        msg: "Server error during update",
        error: error.message,
      });
    }
  },

  postData: async (req, res) => {
    const data = req.body;
    const { userId } = req.params;

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const post = await PostModel.create({
        ...data,
        userId: userId, // ensure userId is set
      });

      await UserModel.findByIdAndUpdate(
        userId,
        { $push: { posts: post._id } },
        { new: true }
      );

      return res.status(200).json({
        post,
        msg: "Post created successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: error.message, msg: "Post creation failed" });
    }
  },
  getMyPosts: async (req, res) => {
    const { userId } = req.params;

    try {
      // 1. Find user by ID
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 2. Get list of post IDs from user
      const postIds = user.posts; // assuming 'posts' is an array of ObjectIds

      if (!postIds || postIds.length === 0) {
        return res
          .status(200)
          .json({ posts: [], message: "User has no posts" });
      }

      // 3. Find matching posts in PostModel
      const posts = await PostModel.find({ _id: { $in: postIds } });

      // 4. Send result
      res.status(200).json({ posts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  },

  togglePostStatus: async (req, res) => {
    try {
      const { id } = req.params;

      const post = await PostModel.findById(id);

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      const newStatus = post.status === "live" ? "closed" : "live";

      const updatedPost = await PostModel.findByIdAndUpdate(
        id,
        { status: newStatus, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: `Status changed to ${newStatus}`,
        post: updatedPost,
      });
    } catch (error) {
      console.error("Error toggling post status:", error);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  },
};
