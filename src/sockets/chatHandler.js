import Message from "../models/Message.js";
export const registerChatHanders = (io,socket)=>{
    socket.on('join_group', (groupId)=>{
        socket.join(groupId);
        console.log(`User ${socket.user.id} joined group room : ${groupId}`)
    });

    socket.on('send_message', async(data)=>{
        const {groupId, content, fileUrl, fileType} = data;
        if (!content || !content.trim()) return;
        const payload = {
            groupId,
            sender:{
                id : socket.user.id,
                name: socket.user.name,
            },
            content: content || '',
            fileUrl: fileUrl || null,
            fileType: fileType || null,
            createdAt: new Date(),
        }
    
    io.to(groupId).emit('receive-message', payload);
    try{
        await Message.create({
            group: groupId,
            sender : socket.user.Id,
            content: content || '',
            fileUrl: fileUrl || null,
            fileType: fileType || null,
        })
    } catch(err){
        console.error('sorry But right now this text is not saved in db ', err);
    }
    })
    socket.on('leave-group',(groupId)=>{
        socket.leave(groupId);
        console.log(`User ${socket.user.id} left group room: ${groupId}`);
    })
    socket.on('typing', ({ groupId, isTyping }) => {
        
    socket.to(groupId).emit('user_typing', {
    userId: socket.user.id,
    userName: socket.user.name,
    isTyping,
  });
});
}
