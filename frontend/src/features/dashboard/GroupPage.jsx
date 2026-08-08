import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import GroupChat from '../../components/GroupChat'; 

export default function GroupPage() {
    // 1. App.jsx me /group/:groupId hai, toh groupId aur id dono support karo:
    const params = useParams();
    const id = params.groupId || params.id;

    const navigate = useNavigate();
    const { user: contextUser, token: contextToken } = useContext(AuthContext); 

    // LocalStorage Fallback (Page refresh par loss na ho)
    const user = contextUser || JSON.parse(localStorage.getItem('user'));
    const token = contextToken || localStorage.getItem('token');

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const res = await API.get(`/groups/${id}`);
                setGroup(res.data.group || res.data);
            } catch (err) {
                console.error('Group details fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-semibold text-sm animate-pulse">
                Loading Channel Space... ⚡
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
                <p className="text-slate-400 mb-4 font-medium text-sm">
                    Group nahi mila ya delete ho chuka hai.
                </p>
                <button 
                    onClick={() => navigate('/')} 
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-xl text-xs border border-slate-700 transition-all"
                >
                    ← Wapas Dashboard Par Chalo
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navbar />

            <div className="max-w-7xl w-full mx-auto p-4 md:p-6 flex-1 flex flex-col md:flex-row gap-6">
                
                {/* Left Side: Channel Main Feed / Chat */}
                <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-2xl">
                    
                    {/* Header */}
                    <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                        <div>
                            <span className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                                {group.category || 'General'}
                            </span>
                            <h1 className="text-2xl font-bold mt-1 text-white">{group.name}</h1>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{group.description}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/')} 
                            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300 font-medium transition-all"
                        >
                            ← Back
                        </button>
                    </div>

                    {/* Real-time Chat Component */}
                    <div className="flex-1 min-h-[420px] flex flex-col justify-center">
                        {user && token ? (
                            <GroupChat groupId={id} currentUser={user} token={token} />
                        ) : (
                            <div className="text-center text-slate-500 text-xs">
                                Please login again to join chat session.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Members Sidebar */}
                <div className="w-full md:w-72 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md h-fit">
                    <h3 className="text-xs font-bold text-slate-300 mb-4 flex items-center justify-between uppercase tracking-wider">
                        <span>👥 Members</span>
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs px-2 py-0.5 rounded-full font-bold">
                            {group.members?.length || 0}
                        </span>
                    </h3>

                    <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                        {group.members && group.members.map((member, idx) => {
                            // Object ya Direct String ID Handling
                            const memberObj = typeof member === 'object' ? member : { _id: member, name: 'Peer User' };
                            const adminId = typeof group.admin === 'object' ? group.admin?._id : group.admin;
                            const isGroupAdmin = adminId === memberObj._id;

                            return (
                                <div key={memberObj._id || idx} className="flex items-center justify-between bg-slate-800/30 p-2.5 rounded-xl border border-slate-800/60 hover:border-slate-700/80 transition-all">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs shrink-0 text-white shadow-md">
                                            {memberObj.name ? memberObj.name.charAt(0).toUpperCase() : 'P'}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-xs font-semibold text-slate-200 truncate">
                                                {memberObj.name || 'Peer Member'}
                                            </p>
                                            {memberObj.email && (
                                                <p className="text-[10px] text-slate-500 truncate">{memberObj.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    {isGroupAdmin && (
                                        <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-bold shrink-0">
                                            👑 Admin
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}