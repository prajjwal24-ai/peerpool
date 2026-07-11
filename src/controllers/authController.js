import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

export const registerUser = async (req,res)=>{
    try{
        const {name, email, password} = req.body;

        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        const user = await User.create({
            name,email,password
        })
        res.status(201).json({
            _id:user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    }
    catch(error) {
        res.status(500).json({
            message : error.message
        })
    }
}



export const loginUser = async (req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if(user && (await user.matchPassword(passsword))){
            res.json({
                _id: user._id,
                name: user.name,
                email : user.email,
                token : generateToken(user._id),
            })
        }else{
            res.status(401).json({
                message : 'Invalid email or Password'
            })
        }
    }catch(err){
        res.status(500).json({
            message : err.message
        });
    }
}
