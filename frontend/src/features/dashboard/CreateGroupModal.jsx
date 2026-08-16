import { useState } from 'react';
import API from '../../services/api';

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [skillsRequired, setSkillsRequired] = useState('');
    
    // 🔒 Privacy States
    const [isPrivate, setIsPrivate] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !description.trim()) {
            setError('Group name and description are required!');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: name.trim(),
                description: description.trim(),
                category,
                skillsRequired: skillsRequired
                    ? skillsRequired.split(',').map((s) => s.trim()).filter(Boolean)
                    : [],
                isPrivate,
                joinCode: isPrivate && joinCode.trim() ? joinCode.trim().toUpperCase() : null,
            };

            const res = await API.post('/groups/create', payload);

            if (res.data.success || res.status === 201) {
                // Reset form fields
                setName('');
                setDescription('');
                setCategory('General');
                setSkillsRequired('');
                setIsPrivate(false);
                setJoinCode('');
                
                if (onGroupCreated) onGroupCreated();
                onClose();
            }
        } catch (err) {
            console.error('Group creation error:', err);
            setError(err.response?.data?.message || 'Failed to create group. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🚀</span>
                        <h2 className="text-lg font-bold text-white">Create New Peer Group</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg hover:bg-slate-800 text-sm font-bold transition"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">
                            {error}
                        </div>
                    )}

                    {/* Group Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Group Name *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. MERN Fullstack Masters"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                        >
                            <option value="General">General</option>
                            <option value="Web Development">Web Development</option>
                            <option value="App Development">App Development</option>
                            <option value="Competitive Programming">Competitive Programming</option>
                            <option value="Machine Learning / AI">Machine Learning / AI</option>
                            <option value="DevOps & Cloud">DevOps & Cloud</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Description *
                        </label>
                        <textarea
                            rows={3}
                            placeholder="What is this group about? Goals, project roadmap, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none"
                        />
                    </div>

                    {/* Skills Required */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Skills Required (Comma separated)
                        </label>
                        <input
                            type="text"
                            placeholder="React, Node.js, Tailwind, MongoDB"
                            value={skillsRequired}
                            onChange={(e) => setSkillsRequired(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
                        />
                    </div>

                    {/* 🔒 Privacy Toggle Card */}
                    <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                    {isPrivate ? '🔒 Private Group' : '🌐 Public Group'}
                                </h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {isPrivate
                                        ? 'Requires an invite code or Admin approval to join.'
                                        : 'Anyone in the hub can discover and join directly.'}
                                </p>
                            </div>

                            {/* Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isPrivate ? 'bg-amber-500' : 'bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isPrivate ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Secret Join Code (Visible only if Private is active) */}
                        {isPrivate && (
                            <div className="pt-2 border-t border-slate-800/80">
                                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex justify-between">
                                    <span>Secret Passcode (Optional)</span>
                                    <span className="text-[10px] text-amber-400">Empty = Admin approval</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. PEER2026"
                                    value={joinCode}
                                    maxLength={10}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono uppercase tracking-wider focus:outline-none focus:border-amber-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Group ➔'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}