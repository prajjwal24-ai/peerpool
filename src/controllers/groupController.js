import Group from '../models/Group.js';
import Message from '../models/Message.js';

export const createGroup = async (req, res) => {
    try {
        const { name, description, category, skillsRequired } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required!'
            });
        }

        let formattedSkills = [];
        if (skillsRequired) {
            formattedSkills = Array.isArray(skillsRequired) 
                ? skillsRequired 
                : skillsRequired.split(',').map(skill => skill.trim());
        }

        const newGroup = new Group({
            name, 
            description, 
            category: category || 'General', 
            skillsRequired: formattedSkills,
            admin: req.user._id,
            members: [req.user._id]
        });

        await newGroup.save();

        res.status(201).json({
            success: true,
            message: 'Group successfully ban gaya! 🎉',
            group: newGroup
        });
    } catch (error) {
        console.error("Create Group Error:", error);
        res.status(500).json({
            success: false,
            message: 'Group banane me error aaya',
            error: error.message
        });
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'name email')
            .populate('members', 'name email')
            .sort({ createdAt: -1 });
        
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
};


export const getGroupById = async (req, res) => {
    try {
        // 💡 FIX 3: Fixed '.populate("member")' -> '.populate("members")'
        const group = await Group.findById(req.params.id)
            .populate('admin', 'name email')
            .populate('members', 'name email');

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

export const getGroupMessages = async (req, res, next) => {
  try {
    const { id } = req.params; // Group ID

    
    const messages = await Message.find({ group: id })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 }); 

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Already Member hai?
    if (group.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    // 🔒 IF PRIVATE GROUP: Direct Join nahi hoga, Request jayegi
    if (group.isPrivate) {
      if (group.pendingRequests.includes(userId)) {
        return res.status(400).json({ success: false, message: 'Request already sent!' });
      }

      group.pendingRequests.push(userId);
      await group.save();

      return res.status(200).json({
        success: true,
        status: 'pending',
        message: 'Join request sent to Admin for approval!',
      });
    }

    // 🌐 IF PUBLIC GROUP: Direct Join
    group.members.push(userId);
    await group.save();

    res.status(200).json({
      success: true,
      status: 'joined',
      message: 'Successfully joined group!',
    });
  } catch (error) {
    console.error('Join Group Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


export const respondToRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { targetUserId, action } = req.body; // action = 'accept' or 'reject'
    const adminId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Security Check: Request sirf Admin hi handle kar sakta hai
    if (group.admin.toString() !== adminId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only Admin can approve or reject requests!',
      });
    }

    // Pending array se user ID hatao
    group.pendingRequests = group.pendingRequests.filter(
      (id) => id.toString() !== targetUserId
    );

    
    if (action === 'accept') {
      if (!group.members.includes(targetUserId)) {
        group.members.push(targetUserId);
      }
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: `User request ${action}ed successfully!`,
    });
  } catch (error) {
    console.error('Respond Request Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};