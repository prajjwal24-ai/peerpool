import Resource from "../models/resourceModel.js";


export const createResource = async (req, res) => {
    try {
        const { title, link, type, poolId,content, sender } = req.body;
        const resource = await Resource.create({
            title,
            link,
            type,
            poolId,
            content,
            sender
        });

        res.status(201).json({ success: true, data: resource });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getPoolResources = async (req, res) =>{
    try{
        const {poolId} = req.params;
        const resources = (await Resource.find({poolId})).toSorted({createdAt : -1});

        const sortedResources = [...resources].sort((a,b)=> b.createdAt - a.createdAt)

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