import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { socket, connectSocket } from '../socket';

import ElectricBorder from './react-bits/ElectricBorder';

export default function GroupChat({ groupId, currentUser, token }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // File upload state

  const [typingUser, setTypingUser] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // File picker ref

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }

    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/groups/${groupId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
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

    const handleUserTyping = ({ userName, isTyping }) => {
      setTypingUser(isTyping ? userName : '');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      socket.emit('leave_group', groupId);
    };
  }, [groupId, token]);

  // Auto Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setText(value);

    if (value.trim()) {
      socket.emit('typing', { groupId, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { groupId, isTyping: false });
      }, 2000);
    } else {
      socket.emit('typing', { groupId, isTyping: false });
    }
  };

  // 👇 File Select/Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      // 1. Upload file to Cloudinary via backend API
      const res = await axios.post('http://localhost:5000/api/chat/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        const { fileUrl, fileType, fileName } = res.data;

        // 2. Emit file via Socket
        const messageData = {
          groupId,
          content: fileName || 'Attached Document',
          fileUrl,
          fileType,
        };
        socket.emit('send_message', messageData);

        // 3. Local optimistic update
        const localMessage = {
          groupId,
          sender: {
            _id: currentUser._id,
            name: currentUser.name || 'You',
          },
          content: fileName || 'Attached Document',
          fileUrl,
          fileType,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, localMessage]);
      }
    } catch (err) {
      console.error('File Upload failed:', err);
      alert('File upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit('typing', { groupId, isTyping: false });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const messageData = { groupId, content: text, fileUrl: '', fileType: '' };
    socket.emit('send_message', messageData);

    const localMessage = {
      groupId,
      sender: {
        _id: currentUser._id,
        name: currentUser.name || 'You',
      },
      content: text,
      fileUrl: '',
      fileType: '',
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
            <h3 className="text-lg font-bold text-white tracking-wide">
              PeerPool Group Chat
            </h3>
            <p className="text-xs text-indigo-400 font-mono">ID: {groupId}</p>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {loading ? (
            <div className="text-center text-indigo-400/80 mt-12 text-sm font-medium animate-pulse">
              Loading chat history... ⚡
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-12 text-sm">
              No messages yet. Say hello or share notes! 👋
            </div>
          ) : (
            messages.map((msg, idx) => {
              const senderId = msg.sender?._id || msg.sender?.id;
              const isMe = senderId === currentUser?._id;

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm backdrop-blur-sm ${
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

                    {/* Conditional Rendering: Text vs File Attachment Card */}
                    {msg.fileUrl ? (
                      <div className="flex flex-col gap-1.5 my-1">
                        <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-indigo-500/20">
                          <span className="text-xl">
                            {msg.fileType === 'pdf'
                              ? '📄'
                              : msg.fileType === 'image'
                              ? '🖼️'
                              : '📝'}
                          </span>
                          <span className="text-xs font-mono truncate max-w-[150px]">
                            {msg.content || 'Attached File'}
                          </span>
                        </div>
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] underline text-cyan-300 hover:text-cyan-200 flex items-center gap-1 self-end font-semibold"
                        >
                          ⬇️ View / Download
                        </a>
                      </div>
                    ) : (
                      <p className="break-words">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator Display */}
        {typingUser && (
          <div className="text-xs italic text-indigo-400 mt-2 flex items-center gap-1.5 animate-pulse">
            <span>{typingUser} is typing...</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}

        {/* Input Form with Attachment Clip */}
        <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 items-center">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
          />

          {/* Attachment Clip Button */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-lg text-sm border border-slate-700 transition-all disabled:opacity-50"
            title="Attach PDF or Notes"
          >
            {uploading ? '⏳' : '📎'}
          </button>

          <input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder={uploading ? 'Uploading document...' : 'Type your message...'}
            disabled={uploading}
            className="flex-1 bg-slate-800/80 border border-slate-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </ElectricBorder>
  );
}