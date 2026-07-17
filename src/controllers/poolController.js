import { Error } from 'mongoose';
import Pool from '../models/poolModel.js';


export const createPool = async (req,res)=>{
    try{
        const {title, description} = req.body;

        if(!title || !description){
            return res.status(400).json({
                success:false,
                message: 'Please enters title and description both are necessary'
            })
        }
        const newPool = await Pool.create({title,description,owner: req.user._id,        // Middleware se aayi user ID
            members: [req.user._id]});
        res.status(201).json({
        success: true,
        message: 'Pool created successfully',
        data: newPool
    });
    }catch(err){
        res.status(500).json({
            success : false,
            messsage : err.message
        })
    }
};

export const getAllPools =async(req,res)=>{
    try{
        const pools = await Pool.find().sort({createdAt: -1}).populate('owner','name email');
        res.status(200).json({
            success:true,
            count : pools.length,
            data: pools
        })

    }catch(error){
        res.status(500).json(
            {
                success:false,
                messsage: error.message
            }
        )
    }
}


export const joinpool = async (req,res) =>{
    try{
        const pool = await Pool.findById(req.params.id);
        if(!pool){
            return res.status(404).json({
                success: false,
                message: 'Pool not found'
            })
        }
        if(pool.members.includes(req.user._id)){
            return res.status(400).json({
                success: false,
                message: 'You are already a member of this pool'
            });
        }

        pool.members.push(req.user._id);
        await pool.save();
        res.status(200).json({
            success: true,
            message: 'Successfully joined the pool',
            data: pool
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
}
};
