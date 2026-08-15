import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { socket, connectSocket } from '../socket';
import SharedFilesModal from "./SharedFilesModel.jsx";
import ElectricBorder from './ui/ElectricBorder.jsx';

export default function GroupChat({ groupId, currentUser, token }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!groupId || !token) return;

    // 1. Connect Socket safely with Auth
    connectSocket(token);

    const joinRoom = () => {
      console.log('⚡ Socket connected! Joining room:', groupId);
      socket.emit('join_group', groupId);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    // 2. Fetch Initial History
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/groups/${groupId}/messages`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setMessages(response.data.data || response.data.messages || []);
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();

    // 3. Socket Listeners
    const handleReceiveMessage = (newMessage) => {
      console.log('📩 New Message Received on Client:', newMessage);
      if (!newMessage) return;
      setMessages((prevMessages) => {
        // Prevent duplicate rendering
        const exists = prevMessages.some(
          (m) =>
            (m._id && newMessage._id && m._id === newMessage._id) ||
            (m.content === newMessage.content && m.createdAt === newMessage.createdAt)
        );
        if (exists) return prevMessages;
        return [...prevMessages, newMessage];
      });
    };

    const handleUserTyping = ({ userName, isTyping }) => {
      setTypingUser(isTyping ? userName : '');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleUserTyping);

    // Cleanup logic
    return () => {
      socket.off('connect', joinRoom);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleUserTyping);
      if (socket.connected) {
        socket.emit('leave_group', groupId);
      }
    };
  }, [groupId, token]);

  // Auto Scroll
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await axios.post(`${API_URL}/api/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        const { fileUrl, fileType, fileName } = res.data;

        const messageData = {
          groupId,
          content: fileName || file.name || 'Attached File',
          fileUrl: fileUrl,
          fileType: fileType || 'document',
        };

        socket.emit('send_message', messageData);
      }
    } catch (err) {
      console.error('File Upload failed:', err);
      alert(err.response?.data?.message || 'File upload failed.');
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

    console.log('📤 Emitting send_message:', messageData);
    socket.emit('send_message', messageData);
    setText('');
  };

  const uploadedFilesCount = messages.filter((m) => Boolean(m.fileUrl)).length;

  return (
    <div className="w-full flex justify-center">
      <ElectricBorder color="#6366f1" speed={1.5} className="w-full max-w-4xl">
        <div className="flex flex-col h-[520px] w-full bg-slate-900/90 backdrop-blur-md rounded-xl p-5 shadow-2xl border border-indigo-500/30">
          
          {/* Header */}
          <div className="border-b border-slate-800/80 pb-3 mb-3 flex justify-between items-center shrink-0">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                PeerPool Group Chat
              </h3>
              <p className="text-xs text-indigo-400 font-mono">ID: {groupId}</p>
            </div>

            {/* Top Right Action Area */}
            <div className="flex items-center gap-3">
              {/* 📁 Shared Files Folder Button */}
              <button
                type="button"
                onClick={() => setShowFilesModal(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 hover:border-indigo-500/50 transition active:scale-95 shadow-sm"
                title="View All Uploaded Files"
              >
                <span>📁</span> Files ({uploadedFilesCount})
              </button>

              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 my-2 custom-scrollbar flex flex-col">
            {loading ? (
              <div className="m-auto text-indigo-400/80 text-sm font-medium animate-pulse">
                Loading chat history... ⚡
              </div>
            ) : messages.length === 0 ? (
              <div className="m-auto text-slate-400 text-sm font-medium">
                No messages yet. Say hello or share notes! 👋
              </div>
            ) : (
              messages.map((msg, idx) => {
                const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
                const currentUserId = currentUser?._id || currentUser?.id;
                const isMe = String(senderId) === String(currentUserId);

                return (
                  <div
                    key={msg._id || idx}
                    className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm backdrop-blur-sm ${
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-semibold text-indigo-400 mb-1">
                          {typeof msg.sender === 'object' && msg.sender?.name
                            ? msg.sender.name
                            : 'Peer'}
                        </p>
                      )}

                      {msg.fileUrl ? (
                        <div className="flex flex-col gap-1.5 my-1">
                          <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-indigo-500/30">
                            <span className="text-xl">
                              {msg.fileType === 'pdf'
                                ? '📄'
                                : msg.fileType === 'image'
                                ? '🖼️'
                                : '📝'}
                            </span>
                            <span className="text-xs font-mono truncate max-w-[180px] text-slate-200">
                              {msg.content || 'Attached Document'}
                            </span>
                          </div>
                          <a
                            href={msg.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] underline text-cyan-300 hover:text-cyan-200 flex items-center gap-1 self-end font-semibold mt-0.5"
                          >
                            ⬇ View / Download
                          </a>
                        </div>
                      ) : (
                        <p className="break-words text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUser && (
            <div className="text-xs italic text-indigo-400 mb-2 flex items-center gap-1.5 animate-pulse shrink-0">
              <span>{typingUser} is typing...</span>
              <span className="flex gap-1">
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          )}

          {/* Bottom Input Section */}
          <form onSubmit={handleSendMessage} className="mt-auto flex gap-2 items-center shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl text-sm border border-slate-700 transition-all disabled:opacity-50"
              title="Attach File"
            >
              {uploading ? '⏳' : '📎'}
            </button>

            <input
              type="text"
              value={text}
              onChange={handleInputChange}
              placeholder={uploading ? 'Uploading file...' : 'Type your message...'}
              disabled={uploading}
              className="flex-1 bg-slate-800/90 border border-slate-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={uploading}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              Send
            </button>
          </form>

        </div>
      </ElectricBorder>

      {/* Shared Files Modal Mounted */}
      <SharedFilesModal
        isOpen={showFilesModal}
        onClose={() => setShowFilesModal(false)}
        messages={messages}
        currentUser={currentUser}
      />
    </div>
  );
}