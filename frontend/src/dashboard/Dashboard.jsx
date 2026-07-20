import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Galaxy from '../../components/ui/Galaxy';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
    const { user } = useContext(AuthContext);

    return (
        <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            {/* Background Theme */}
            <Galaxy 
                mouseRepulsion={true}
                mouseInteraction={true}
                density={1.0}
                glowIntensity={0.4}
                saturation={0.8}
                hueShift={200}
                twinkleIntensity={0.4}
                rotationSpeed={0.03}
                transparent={true}
            />

            {/* Header */}
            <Navbar />

            {/* Dashboard Main Content */}
            <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col items-center justify-center">
                <div className="w-full bg-slate-900/50 backdrop-blur-lg border border-slate-800/80 rounded-2xl p-8 text-center shadow-2xl">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 mb-4">
                        Welcome to your PeerPool Hub
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
                        You're officially authenticated. From here, you can connect with peers, manage requests, and build collaborative projects.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all">
                            <h3 className="text-cyan-400 font-semibold mb-1">🔍 Peer Finder</h3>
                            <p className="text-xs text-slate-400">Discover and match with other developers on campus.</p>
                        </div>
                        <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all">
                            <h3 className="text-cyan-400 font-semibold mb-1">📁 Projects Pool</h3>
                            <p className="text-xs text-slate-400">Share your ongoing project ideas or join team requests.</p>
                        </div>
                        <div className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-cyan-500/50 transition-all">
                            <h3 className="text-cyan-400 font-semibold mb-1">⚙️ Profile Settings</h3>
                            <p className="text-xs text-slate-400">Update your technical skills, portfolio links, and bio.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
