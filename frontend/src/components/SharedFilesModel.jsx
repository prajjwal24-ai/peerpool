import React, { useState } from 'react';

export default function SharedFilesModal({ isOpen, onClose, messages = [] }) {
  const [filter, setFilter] = useState('all');

  if (!isOpen) return null;

  // Filter messages that have a valid fileUrl
  const fileMessages = messages.filter((msg) => Boolean(msg.fileUrl));

  const filteredFiles = fileMessages.filter((msg) => {
    if (filter === 'all') return true;
    return msg.fileType === filter;
  });

  const getFileIcon = (fileType) => {
    if (fileType === 'pdf') return '📄';
    if (fileType === 'image') return '🖼️';
    return '📝';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📁</span>
            <h3 className="text-lg font-bold text-white tracking-wide">Shared Files & Resources</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 p-3 border-b border-slate-800/60 bg-slate-900/50">
          {['all', 'pdf', 'image', 'document'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 text-xs rounded-full capitalize font-medium transition ${
                filter === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* File List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
  {filteredFiles.length === 0 ? (
    <div className="text-center text-slate-500 text-sm py-12">
      No shared files found in this category.
    </div>
  ) : (
    filteredFiles.map((fileMsg, index) => {
      // 💡 FIX 1: Curly braces {} hata diye
      const uploaderName =
        typeof fileMsg.sender === 'object'
          ? fileMsg.sender?.name || 'Peer'
          : currentUser?._id === fileMsg.sender || currentUser?.id === fileMsg.sender
          ? currentUser.name
          : 'Peer';

      return (
        <div
          key={fileMsg._id || index}
          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-indigo-500/40 transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl p-2 rounded-lg bg-slate-900 border border-slate-700">
              {getFileIcon(fileMsg.fileType)}
            </span>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {fileMsg.content || 'Untitled Document'}
              </p>
              <p className="text-xs text-slate-400">
                Uploaded by <span className="text-indigo-400">{uploaderName}</span> •{' '}
                {fileMsg.createdAt
                  ? new Date(fileMsg.createdAt).toLocaleDateString()
                  : 'Recent'}
              </p>
            </div>
          </div>

          <a
            href={fileMsg.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 shrink-0 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold rounded-lg border border-indigo-500/30 transition flex items-center gap-1"
          >
            ⬇ Open
          </a>
            </div>
        );
        })
    )}
    </div>
      </div>
    </div>
  );
}
