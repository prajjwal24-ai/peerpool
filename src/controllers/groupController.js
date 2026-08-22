import Group from '../models/Group.js';
import Message from '../models/Message.js';

export const createGroup = async (req, res) => {
  try {
    const { name, description, category, skillsRequired, isPrivate, joinCode } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required!',
      });
    }

    let formattedSkills = [];
    if (skillsRequired) {
      formattedSkills = Array.isArray(skillsRequired)
        ? skillsRequired
        : skillsRequired.split(',').map((s) => s.trim());
    }

    const newGroup = new Group({
      name,
      description,
      category: category || 'General',
      skillsRequired: formattedSkills,
      isPrivate: Boolean(isPrivate),
      joinCode: isPrivate ? joinCode || Math.random().toString(36).substring(2, 8).toUpperCase() : null,
      admin: req.user._id,
      members: [req.user._id],
      pendingRequests: [],
    });

    await newGroup.save();

    res.status(201).json({
      success: true,
      message: 'Group successfully ban gaya! 🎉',
      group: newGroup,
    });
  } catch (error) {
    console.error('Create Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Group banane me error aaya',
      error: error.message,
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
    const { joinCode } = req.body; // user code enter kar sakta hai
    const userId = req.user._id || req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if already a member
    const isMember = group.members.some((m) => m.toString() === userId.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'You are already a member of this group' });
    }

    // 🔒 PRIVATE GROUP LOGIC
    if (group.isPrivate) {
      // Case A: Agar user ne correct joinCode diya hai toh seedha add kar do
      if (joinCode && group.joinCode && joinCode.trim().toUpperCase() === group.joinCode.toUpperCase()) {
        group.members.push(userId);
        await group.save();
        return res.status(200).json({
          success: true,
          message: 'Correct Code! Joined private group successfully 🎉',
          group,
        });
      }

      // Case B: Agar Code nahi hai, toh Admin ke liye Request create karo
      const alreadyRequested = group.pendingRequests?.some((id) => id.toString() === userId.toString());
      if (alreadyRequested) {
        return res.status(400).json({ success: false, message: 'Join request already pending with Admin.' });
      }

      group.pendingRequests.push(userId);
      await group.save();

      return res.status(200).json({
        success: true,
        isPending: true,
        message: 'This is a private group. Join request sent to Admin for approval! ⏳',
      });
    }

    // 🌐 PUBLIC GROUP: Seedha join karao
    group.members.push(userId);
    await group.save();

    return res.status(200).json({
      success: true,
      message: 'Joined group successfully! 🎉',
      group,
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
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

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User unauthorized' });
    }

    // $pull automatically finds and removes the userId (handles both ObjectId & strings)
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      {
        $pull: {
          members: userId, // Agar members plain IDs ka array hai
          // Agar members object array hai { user: userId }, toh uncomment karo:
          // members: { user: userId }
        },
      },
      { new: true }
    );

    if (!updatedGroup) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Left group successfully',
    });
  } catch (error) {
    console.error('Leave Group Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
