import {useState} from 'react';
import API from '../../services/api';

export default function CreateGroupModal({isOpen, onClose, onGroupCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        skillsRequired: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if(!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await API.post('/groups/create', formData);
            // Form clear kar do
            setFormData({ name: '', description: '', category: 'Web Dev', skillsRequired: '' });
            onGroupCreated(); // Dashboard par groups ki list refresh karega
            onClose(); // Modal band kar do
        } catch (err) {
            setError(err.response?.data?.message || 'Group create nahi ho paya!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative z-10 text-white">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Create New Peer Group 🚀
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-slate-400 hover:text-white transition-colors text-lg font-bold"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="text-red-400 text-xs mb-4 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Group Name
                        </label>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., MERN Stack Masters"
                            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Category
                        </label>
                        <select 
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                        >
                            <option value="Web Dev">Web Development</option>
                            <option value="Machine Learning">Machine Learning / AI</option>
                            <option value="Flutter / Mobile">Flutter / Mobile App</option>
                            <option value="Competitive Programming">Competitive Programming</option>
                            <option value="General">General / Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Description
                        </label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Aapke group ka main focus kya hoga?"
                            rows="3"
                            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm resize-none transition-all"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Skills Required <span className="text-slate-500 font-normal">(Optional, comma separated)</span>
                        </label>
                        <input 
                            type="text"
                            value={formData.skillsRequired}
                            onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                            placeholder="React, Node.js, MongoDB"
                            className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm transition-all"
                        />
                    </div>

                    <div className="flex space-x-3 pt-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-1/2 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all transform active:scale-[0.98]"
                        >
                            {loading ? 'Creating...' : 'Build Group ✨'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

