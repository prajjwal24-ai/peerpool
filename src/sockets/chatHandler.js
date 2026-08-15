import Message from "../models/Message.js";

export const registerChatHandlers = (io, socket) => {
    // 1. Join Group
    socket.on('join_group', (groupId) => {
        if (!groupId) return;
        socket.join(groupId);
        console.log(`User ${socket.user?.name || socket.user?.id} joined group room : ${groupId}`);
    });

    // 2. Send Message (Text & Files)
    socket.on('send_message', async (data) => {
    try {
        const { groupId, content, fileUrl, fileType } = data;

        // Content ya file me se koi ek hona zaroori hai
        if ((!content || !content.trim()) && !fileUrl) {
            return;
        }

        const senderId = socket.user?.id || socket.user?._id;

        // 1. Pehle Database me Message create karo
        const newMessage = await Message.create({
            group: groupId,
            sender: senderId,
            content: content || (fileUrl ? 'Attached File' : ''),
            fileUrl: fileUrl || null,
            fileType: fileType || null,
        });

        // 2. User details populate karo (name, email, avatar)
        await newMessage.populate('sender', 'name email avatar');

        // 3. Complete saved + populated message room me broadcast karo
        io.to(groupId.toString()).emit('receive_message', newMessage);

    } catch (err) {
        console.error('Error saving or emitting socket message:', err);
    }
});

    // 3. Leave Group
    socket.on('leave_group', (groupId) => {
        socket.leave(groupId);
        console.log(`User ${socket.user?.id} left group room: ${groupId}`);
    });

    // 4. Typing Indicator
    socket.on('typing', ({ groupId, isTyping }) => {
        socket.to(groupId).emit('user_typing', {
            userId: socket.user?.id,
            userName: socket.user?.name,
            isTyping,
        });
    });
};