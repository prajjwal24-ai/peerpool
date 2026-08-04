import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import API from '../../services/api';
import Navbar from '../../components/Navbar';
import GroupChat from '../../components/GroupChat'; 

export default function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext); 

    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            try {
                const res = await API.get(`/groups/${id}`);
                setGroup(res.data.group);
            } catch (err) {
                console.error('Group details error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGroupDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-semibold text-cyan-400">
                Loading Channel Space ....
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
                <p className="text-slate-400 mb-4">Group nahi mila ya delete ho chuka hai.</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="px-4 py-2 bg-slate-800 text-cyan-400 font-semibold rounded-xl text-sm"
                >
                     Wapas Dashboard Par Chalo
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navbar />

            <div className="max-w-7xl w-full mx-auto p-6 flex-1 flex flex-col md:flex-row gap-6">
                
                {/* Left Side: Channel Main Feed / Chat */}
                <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md">
                    
                    {/* Header */}
                    <div className="border-b border-slate-800 pb-4 mb-4 flex justify-between items-center">
                        <div>
                            <span className="text-xs uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                                {group.category}
                            </span>
                            <h1 className="text-2xl font-bold mt-1 text-white">{group.name}</h1>
                            <p className="text-xs text-slate-400 mt-1">{group.description}</p>
                        </div>
                        <button 
                            onClick={() => navigate('/')} 
                            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-300"
                        >
                            ← Back
                        </button>
                    </div>

                    {/* 3. Real-time Chat Component Rendered Here */}
                    <div className="flex-1 min-h-[400px]">
                        {user && token && (
                            <GroupChat groupId={id} currentUser={user} token={token} />
                        )}
                    </div>
                </div>

                {/* Right Side: Members Sidebar */}
                <div className="w-full md:w-72 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md h-fit">
                    <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center justify-between">
                        <span>👥 Group Members</span>
                        <span className="bg-slate-800 text-cyan-400 text-xs px-2 py-0.5 rounded-full">
                            {group.members.length}
                        </span>
                    </h3>

                    <div className="space-y-3">
                        {group.members.map((member) => {
                            const isGroupAdmin = group.admin?._id === member._id;
                            return (
                                <div key={member._id} className="flex items-center justify-between bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs">
                                            {member.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-200">{member.name}</p>
                                            <p className="text-[10px] text-slate-500">{member.email}</p>
                                        </div>
                                    </div>
                                    {isGroupAdmin && (
                                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                            Admin
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