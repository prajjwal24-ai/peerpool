import { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
    const [isLoginView, setIsLoginView] = useState(true);
    const { user } = useContext(AuthContext);

    // Agar User Logged-in hai -> Show Protected Dashboard
    if (user) {
        return (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        );
    }

    // Agar User Logged-in nahi hai -> Toggle between Login & Register
    return isLoginView ? (
        <Login onSwitch={() => setIsLoginView(false)} />
    ) : (
        <Register onSwitch={() => setIsLoginView(true)} />
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
