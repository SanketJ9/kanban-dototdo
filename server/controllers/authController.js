import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { name,username,email,contactNumber, password } = req.body;
        
        const existingUser = await User.findOne({ $or: [{email}, {username}] });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exist'})
        }

        const salt = await bcrypt.genSalt(10);
        
        const hashedPassword = await bcrypt.hash(password, salt);

        const profileImage = req.file ? `/upload/${req.file.filename}` : "";

        const newUser = new User({
            name,
            username,
            email,
            contactNumber,
            password: hashedPassword,
            profileImage
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully'});

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "server errror while registering"})
    }
};

export const login = async (req, res) => {
    try {
        const { email, password} = req.body;

        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({message: "Invalid email or Passwoord"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password"})
        }

        const token = jwt.sign(
            {userId: user._id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        res.status(200).json({
            message: "Login Successfull!",
            token: token,
            user: {
                id:user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            }
        })
    }catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({message: 'server errror while Login'})
    }

}