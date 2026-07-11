import Resource from "../models/resourceModel";

export const getPoolResources = async (req, res) =>{
    try{
        const {poolId} = req.params;
        const resources = (await Resource.find({poolId})).toSorted({createdAt : -1});

        res.status(200).json({
            success : true,
            count : resources.length,
            data : resources
        });

    }catch (error){
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}