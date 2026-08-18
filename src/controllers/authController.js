import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER CONTROLLER
export const registerUser = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields (Name, Email, Password) are required!' });
        }

        email = email.trim().toLowerCase();
        name = name.trim();

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long!' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email!' });
        }

        // Hash password
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user in MongoDB
        const user = await User.create({
            name,
            email,
            password,
        });

        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'peerpool_secret_123',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message || 'Server error during registration' });
    }
};

// LOGIN CONTROLLER
export const loginUser = async (req, res) => {
    try {
        let { email, password } = req.body;

        console.log("👉 Login Attempt Received Body:", req.body);

        if (!email || !password) {
            console.log("❌ Missing email or password in request");
            return res.status(400).json({ message: 'Email and password are required!' });
        }

        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`❌ User with email "${email}" not found in DB`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log(`❌ Password mismatch for email "${email}"`);
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'peerpool_secret_123',
            { expiresIn: '7d' }
        );

        console.log(`✅ Login successful for: ${email}`);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};