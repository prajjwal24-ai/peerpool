import Message from "../models/Message";
export const registerChatHanders = (io,socket)=>{
    socket.on('join_group', (groupId)=>{
        socket.join(groupId);
        console.log(`User ${socket.user.id} joined group room : ${groupId}`)
    });

    socket.on('send_message', async(data)=>{
        const {groupId, content} = data;
        const payload = {
            groupId,
            sender:{
                id : socket.user.id,
                name: socket.user.name,
            },
            content,
            createdAt: new Date(),
        }
    })
}