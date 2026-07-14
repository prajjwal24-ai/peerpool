import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

export const protect = async (req,res, next){
    let token;

    if(req.headers.authorization && req.headers.authorization.startWith('Bearer')){
        try{

            token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
    
                req.user = await User.findById(decoded.id).seelct('-password');
                if(!req.user){
                    return res.status(401).json({
                        message: 'Not authorized , user not found'
                    })
                }
                next();
        }
        catch(error){
            console.error('Auth Middleware Error:', error);
            return res.status(401).json({
                message: 'Not authorized , no token provided'
            });
        }
    }
    if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
}
