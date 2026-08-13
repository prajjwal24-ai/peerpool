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
        const { groupId, content, fileUrl, fileType } = data;
        if ((!content || !content.trim()) && !fileUrl) {
            return;
        }

        const payload = {
            groupId,
            sender: {
                _id: socket.user?.id || socket.user?._id,
                id: socket.user?.id || socket.user?._id,
                name: socket.user?.name || 'Peer',
            },
            content: content || '',
            fileUrl: fileUrl || null,
            fileType: fileType || null,
            createdAt: new Date().toISOString(),
        };

        // FIXED 2: Underscore wala event emit karo taaki frontend receive kar sake!
        io.to(groupId).emit('receive_message', payload);

        // Save to Database
        try {
            await Message.create({
                group: groupId,
                sender: socket.user?.id || socket.user?._id, // FIXED 3: Corrected socket.user.Id typo
                content: content || '',
                fileUrl: fileUrl || null,
                fileType: fileType || null,
            });
        } catch (err) {
            console.error('sorry But right now this text is not saved in db ', err);
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