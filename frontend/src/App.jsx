import { useState, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import GroupPage from './features/dashboard/GroupPage';
import ProtectedRoute from './components/ProtectedRoutes';

export default function App() {
    const [isLoginView, setIsLoginView] = useState(true);
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-cyan-400 flex items-center justify-center font-bold">
                Authenticating PeerPool... ⚡
            </div>
        );
    }

    return (
        <Routes>
            {/* Unauthenticated Routes */}
            {!user ? (
                <>
                    <Route 
                        path="/login" 
                        element={
                            isLoginView ? (
                                <Login onSwitch={() => setIsLoginView(false)} />
                            ) : (
                                <Register onSwitch={() => setIsLoginView(true)} />
                            )
                        }
                    />
                    {/* Kisi bhi random path par ho, login par bhejo */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </>
            ) : (
                <>
                    {/* Authenticated Routes */}
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/group/:groupId" 
                        element={
                            <ProtectedRoute>
                                <GroupPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </>
            )}
        </Routes>
    );
}