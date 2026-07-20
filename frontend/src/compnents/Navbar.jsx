import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="relative z-20 w-full bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    PeerPool
                </span>
            </div>

            {user && (
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-300">
                        Hey, <strong className="text-cyan-400 font-semibold">{user.name || 'Developer'}</strong> 👋
                    </span>
                    <button
                        onClick={logout}
                        className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold rounded-lg transition-all"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </nav>
    );
}