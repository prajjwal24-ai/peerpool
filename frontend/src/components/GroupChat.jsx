import { useEffect, useState } from 'react';
import { socket, connectSocket } from '../socket';

import ElectricBorder from './react-bits/ElectricBorder';

export default function GroupChat({ groupId, currentUser, token }){
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    
    useEffect(() => {
        if(token){
            connectSocket(token);
        }
        const fetchChatHistory = async () => {
      try {
        setLoading(true);
        
        // 👇 Aapse pucha gaya code YAHAN AAYEGA
        const response = await axios.get(
          `http://localhost:5000/api/groups/${groupId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChatHistory();

    socket.emit('join_group', groupId);
    const handleReceiveMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    };
    socket.on('receive_message', handleReceiveMessage);
    return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.emit('leave_group', groupId);
    };
    },[groupId, token]);

    const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const messageData = { groupId, content: text };
    socket.emit('send_message', messageData);

    const localMessage = {
      groupId,
      sender: {
        id: currentUser._id,
        name: currentUser.name || 'You',
      },
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, localMessage]);
    setText('');
  };

  

return (
    <ElectricBorder color="#6366f1" speed={1.5}>
      <div className="flex flex-col h-[500px] w-full max-w-2xl bg-slate-900/90 backdrop-blur-md rounded-xl p-4 shadow-xl border border-indigo-500/30">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">PeerPool Group Chat</h3>
            <p className="text-xs text-indigo-400 font-mono">ID: {groupId}</p>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isMe = msg.sender?.id === currentUser._id;
            return (
              <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm backdrop-blur-sm ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}
                >
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-indigo-400 mb-0.5">
                      {msg.sender?.name}
                    </p>
                  )}
                  <p className="break-words">{msg.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/30"
          >
            Send
          </button>
        </form>
      </div>
    </ElectricBorder>
  );
}