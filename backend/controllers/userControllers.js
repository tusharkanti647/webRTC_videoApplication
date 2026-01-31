
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

//register new user by put manual data
export const register = async (req, res) => {
    try {
        const { name, email, password, reyTypePassword } = req.body;
        // console.log(name, email, password, reyTypePassword)
        if (!name || !email || !password || !reyTypePassword) {
            return res.status(400).json({ message: "Something went missing.", missing: true, success: false });
        }
        const existUser = await User.findOne({ email: email });
        if (existUser) {
            return res.status(409).json({ message: "User already exist with this email.", missing: false, success: false });
        }

        const hashPassWord = await bcrypt.hash(password, 10);

        // await User.create({ name, email, password: hashPassWord })

        const user = new User(
            { name, email, password: hashPassWord }
        );

        const response = await user.save();
        let userId = response._id;
        const tokenData = {
            userId
        }

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '10d' });

        return res.status(200).cookie('JWTToken', token, {
            maxAge: 10 * 24 * 3600 * 1000, httpOnly: true,
            // sameSite: "strict" 
            secure: false, // Set to `true` in production with HTTPS
            sameSite: "Lax", // Cookie will be sent only in safe contexts
        }).json({
            message: 'Account created successfully',
            success: true,
            user
        });
        // return res.status(200).json({ message: 'Account created successfully', success: true });
    } catch (e) {
        console.log('ERROR', e);
        return res.status(500).json({ message: "Internal Server Error.", missing: false, success: false });
    }
}

//register new user by used google auth
export const googleLogin = async (req, res) => {
    try {
        const { googleToken } = req.body;
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

        const client = new OAuth2Client(GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        const existUser = await User.findOne({ email: email });
        let userId, newUser;

        //if user is already exist then send the login token
        //if not exist then create a new one user and send the login token
        if (!existUser) {
            // await User.create({ name, email })
            const user = new User({
                name, email
            });

            const response = await user.save();
            userId = response._id;
            newUser = response;

        } else {
            userId = existUser._id;
            newUser = existUser
        }

        const tokenData = {
            userId
        }

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '10d' });

        return res.status(200).cookie('JWTToken', token, {
            maxAge: 10 * 24 * 3600 * 1000,
            httpOnly: true,
            //  sameSite: "strict"
            secure: false, // Set to `true` in production with HTTPS
            sameSite: "Lax", // Cookie will be sent only in safe contexts
        }).json({
            message: `Welcome back ${newUser.name}`,
            success: true,
            newUser
        });
    } catch (e) {
        console.log('ERROR', e);
        return res.status(500).json({ message: "Internal Server Error.", success: false });
    }
}

//user login
export const login = async (req, res) => {
    try {
        const { email, password, } = req.body;
        // console.log(req.body, email, password)
        if (!email || !password) {
            return res.status(400).json({ message: "Something went missing.", missing: true, success: false });
        }
        let existUser = await User.findOne({ email: email });
        if (!existUser) {
            return res.status(401).json({ message: "Incorrect credentials.", missing: false, success: false });
        }

        const isPasswordMatch = await bcrypt.compare(password, existUser.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Incorrect credentials.", missing: false, success: false });
        }

        const tokenData = {
            userId: existUser._id
        }

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '10d' });

        // console.log('JWTToken', token);
        return res.status(200).cookie('JWTToken', token, {
            maxAge: 10 * 24 * 3600 * 1000,
            // httpOnly: true, secure: true, sameSite: "none",
            httpOnly: true, // Prevent JavaScript access
            secure: false, // Set to `true` in production with HTTPS
            sameSite: "Lax", // Cookie will be sent only in safe contexts
        }).json({
            message: `Welcome back ${existUser.name}`,
            success: true,
            user: existUser
        });


    } catch (e) {
        console.log('ERROR', e);
        return res.status(500).json({ message: "Internal Server Error.", missing: false, success: false });
    }
}


// Authentication Check
export const authCheck = (req, res) => {
    // const userId = req.id;
    const userId = req.id;
    // console.log(userId)
    try {
        if (userId)
            return res.status(200).json({ authenticated: true, user: userId, success: true });
        else return res.status(401).json({ authenticated: false, message: 'Invalid token', success: false });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error.", authenticated: false, success: false });
    }
};



//user logout
export const logOut = async (req, res) => {
    try {
        return res.status(200).cookie("JWTToken", "", { maxAge: 0 }).json({
            message: 'Logged out successfully',
            success: true
        });
    } catch (e) {
        console.log('ERROR', e);
        return res.status(500).json({ message: "Internal Server Error.", success: false });
    }
}