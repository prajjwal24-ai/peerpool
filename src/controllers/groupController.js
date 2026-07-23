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

export const joinGroup = async (req,res) => {
    try{
        const groupId = req.params.id;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Group nahi mila!'
            });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Aap pehle se is group ke member ho!'
            });
        }
        group.members.push(userId);
        await group.save();
        res.status(200).json({
            success: true,
            message: 'Group join kar liya! 🤝',
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Group join karne me error aaya',
            error: error.message
        });
}
};

export const getGroupById = async (req,res)=>{
    try{
        const group = await Group.findById(req.params.id)
                .populate('admin' , 'name email')
                .populate('member' , 'name email');
                if (!group) {
                return res.status(404).json({
                    success: false,
                    message: 'Group nahi mila!'
                });
            }
            res.status(200).json({
            success: true,
            group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Group details fetch karne me error aaya',
            error: error.message
        });
}
};