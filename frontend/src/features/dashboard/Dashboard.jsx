import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import Galaxy from '../../components/ui/Galaxy';
import Navbar from '../../components/Navbar';
import CreateGroupModal from './CreateGroupModal';
import MagicBento from '../../components/ui/MagicBento';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [joinLoading, setJoinLoading] = useState(null);

    const fetchGroups = async () => {
        try {
            const res = await API.get('/groups');
            setGroups(res.data.groups || []);
        } catch (err) {
            console.error('Groups fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    // FIX 1: Cleaned Function Signature (Passing groupId cleanly)
    const handleJoinGroup = async (groupId) => {
        if (!groupId) return;

        setJoinLoading(groupId);
        try {
            const res = await API.post(`/groups/${groupId}/join`);
            
            if (res.data.status === 'pending') {
                alert('Admin approval required. Join request sent!');
                await fetchGroups();
            } else {
                navigate(`/group/${groupId}`);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || '';
            
            // FIX 2: Strict Already Member Check
            if (errorMsg.toLowerCase().includes('already') || errorMsg.toLowerCase().includes('member')) {
                navigate(`/group/${groupId}`);
            } else {
                alert(errorMsg || 'Group join karne me issue aaya.');
            }
        } finally {
            setJoinLoading(null);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            <Galaxy 
                mouseRepulsion={true}
                density={1.0}
                glowIntensity={0.4}
                hueShift={200}
                transparent={true}
            />

            <Navbar />

            <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
                {/* Hero Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 rounded-2xl">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                            Peer Collaboration Hub 
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Discover active peer groups, match with developers, or build your own dev team.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all transform active:scale-95"
                    >
                        + Create Group
                    </button>
                </div>

                {/* Groups MagicBento Grid */}
                <div className="flex-1 flex flex-col items-center">
                    <h2 className="text-lg font-bold text-slate-200 mb-6 w-full flex items-center gap-2">
                        <span> Active Groups</span>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-bold">
                            {groups.length}
                        </span>
                    </h2>

                    {loading ? (
                        <div className="py-20 text-cyan-400 font-semibold animate-pulse">
                            Loading Magic Bento Grid... ⚡
                        </div>
                    ) : groups.length === 0 ? (
                        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/50 rounded-2xl p-8 w-full max-w-md">
                            <p className="text-slate-400 text-sm mb-4">Abhi tak koi group nahi bana hai!</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-xs text-cyan-400 underline font-semibold hover:text-cyan-300"
                            >
                                Create your group dude
                            </button>
                        </div>
                    ) : (
                        <MagicBento glowColor="6, 182, 212">
                            {groups.map((group) => {
                                const isMember = group.members?.some(
                                    (m) => (typeof m === 'object' ? m._id : m) === user?._id
                                );
                                const isAdmin = (typeof group.admin === 'object' ? group.admin?._id : group.admin) === user?._id;

                                return (
                                    <div 
                                        key={group._id} 
                                        onClick={() => isMember && navigate(`/group/${group._id}`)}
                                        className={`flex flex-col justify-between h-full p-1 ${
                                            isMember ? 'cursor-pointer hover:border-cyan-400/80 transition-all' : ''
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                                                    {group.category || 'General'}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    👥 {group.members?.length || 0} Members
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-bold text-white mb-2">
                                                {group.name}
                                            </h3>

                                            <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">
                                                {group.description}
                                            </p>

                                            {group.skillsRequired && group.skillsRequired.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {group.skillsRequired.map((skill, index) => (
                                                        <span key={index} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer / Status Button */}
                                        <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between mt-auto">
                                            <span className="text-[11px] text-slate-400">
                                                Admin: <strong className="text-slate-300">{group.admin?.name || 'Peer'}</strong>
                                            </span>

                                            {isMember ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/group/${group._id}`);
                                                    }}
                                                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                                                >
                                                    {isAdmin ? '👑 Admin' : '💬 Open Chat'}
                                                    <span className="text-[10px] opacity-75">➔</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // FIX 3: Correct single argument call
                                                        handleJoinGroup(group._id);
                                                    }}
                                                    disabled={joinLoading === group._id}
                                                    className="px-4 py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                                >
                                                    {joinLoading === group._id ? 'Joining...' : 'Join Group'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </MagicBento>
                    )}
                </div>
            </main>

            <CreateGroupModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onGroupCreated={fetchGroups}
            />
        </div>
    );
}