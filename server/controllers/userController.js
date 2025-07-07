import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// SignUP new User
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.json({success: false, message: "Please fill all the fields"});
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.json({success: false, message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            bio
        });

        const token = generateToken(newUser._id)
        res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account created Successfully"
        })
    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// TO login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({email})

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect){
            res.json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        const token = generateToken(userData._id)
        res.json({
            success: true,
            userData,
            token,
            message: "Login Successfully"
        })
    } catch(error){
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }
}

// if user is authenticated
export const checkAuth = (req, res) => {
    res.json({
        success: true,
        user: req.user
    })
}

// Update User Profile

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {
                fullName,
                bio
            }, {new: true})
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {
                profilePic: upload.secure_url,
                bio,
                fullName
            }, {new: true});
        }
        res.json({
            success: true,
            user: updatedUser
        })
    } catch (error){
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        })
    }

}