import Group from '../models/Group.js';

export const createGroup = async (req,res)=>{
    try{
        const {name, description, category , skillsRequired} = req.body;
        let formattedSkills = [];
        if(skillsRequired){
            formattedSkills = Array.isArray(skillsRequired)?skillsRequired:skillsRequired.split(',').map(skill => skill.trim());

        }
        const newGroup = new Group ({
            name, descriptioon, category, 
            skillsRequired: formattedSkills,
            admin: req.user._id,
            member : [req.user._id]
        });
        await newGroup.save();
        res.status(201).json({
            success: true,
            message: 'Group successfully ban gaya! 🎉',
            group: newGroup
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Group banane me error aaya',
            error: error.message
        });
}
};

export const getAllGroups = async(req,res)=>{
    try{
        const groups = await Group.find()
            .populate('admin', 'name email')
            .populate('members','name email')
            .sort({createdAt: -1});
        
        res.status(200).json({
            success: true,
            groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Groups fetch karne me error aaya',
            error: error.message
        });
}
}