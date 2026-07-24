import { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import GroupPage from './features/dashboard/GroupPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
    const [isLoginView, setIsLoginView] = useState(true);
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-bold">
                Authenticating PeerPool... ⚡
            </div>
        );
    }

    // Agar User Logged-in nahi hai -> Toggle between Login & Register
    if (!user) {
        return isLoginView ? (
            <Login onSwitch={() => setIsLoginView(false)} />
        ) : (
            <Register onSwitch={() => setIsLoginView(true)} />
        );
    }

    // Agar User Logged-in hai -> Full React Router Navigation
    return (
        <Router>
            <Routes>
                {/* Main Dashboard Feed */}
                <Route 
                    path="/" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Group Channel & Chat Page */}
                <Route 
                    path="/group/:id" 
                    element={
                        <ProtectedRoute>
                            <GroupPage />
                        </ProtectedRoute>
                    } 
                />

                {/* Catch-all route to redirect back to Dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
