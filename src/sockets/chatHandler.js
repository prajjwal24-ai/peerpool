import Message from "../models/Message.js";

export const registerChatHandlers = (io, socket) => {
    // 1. Join Group
    socket.on('join_group', (groupId) => {
        if (!groupId) return;
        socket.join(groupId.toString());
        console.log(`User ${socket.user?.name || socket.user?.id} joined group room: ${groupId}`);
    });

    // 2. Send Message (Text & Files)
    socket.on('send_message', async (data) => {
        try {
            const { groupId, content, fileUrl, fileType, fileName } = data;

            // Content ya fileUrl me se koi ek hona zaroori hai
            if ((!content || !content.trim()) && !fileUrl) {
                return;
            }

            const senderId = socket.user?.id || socket.user?._id;

            // 1. Pehle Database me Message create karo (Schema fields matched)
            const newMessage = await Message.create({
                group: groupId,
                sender: senderId,
                content: content ? content.trim() : (fileName || 'Attached File'),
                messageType: fileType || (fileUrl ? 'file' : 'text'),
                fileUrl: fileUrl || '',
                fileName: fileName || '',
            });

            // 2. User details populate karo (name, email)
            await newMessage.populate('sender', 'name email');
            io.to(groupId.toString()).emit('receive_message', newMessage);

        } catch (err) {
            console.error('Error saving or emitting socket message:', err);
        }
    });

    // 3. Leave Group
    socket.on('leave_group', (groupId) => {
        if (!groupId) return;
        socket.leave(groupId.toString());
        console.log(`User ${socket.user?.name || socket.user?.id} left group room: ${groupId}`);
    });

    // 4. Typing Indicator
    socket.on('typing', ({ groupId, isTyping }) => {
        if (!groupId) return;
        socket.to(groupId.toString()).emit('user_typing', {
            userId: socket.user?.id || socket.user?._id,
            userName: socket.user?.name || 'Peer',
            isTyping,
        });
    });
};