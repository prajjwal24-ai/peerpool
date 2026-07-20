import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    // Jab tak browser memory se token check ho raha hai
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-bold">
                Loading PeerPool... 🚀
            </div>
        );
    }

    // Agar user login nahi hai, toh tab tak children (Dashboard) render nahi hoga
    return user ? children : null;
}