import jwt from 'jsonwebtoken';
import  User  from '../models/userModel.js';

export const protect = async (req,res, next)=>{
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{

            token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_fallback_secret');
    
                req.user = await User.findById(decoded.id).select('-password');
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

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token exists in "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access Denied: No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];

    // JWT Secret wahi use karo jo login/register me kiya tha
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'peerpool_secret_123');

    // Attach decoded user payload to req.user (contains id, name, email)
    req.user = decoded;
    
    next(); // Next controller (leaveGroup) par move karo
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};