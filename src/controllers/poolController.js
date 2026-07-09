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
        const newPool = await Pool.create({title,description});
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
        const pools = await Pool.find().sort({createdAt: -1});
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
