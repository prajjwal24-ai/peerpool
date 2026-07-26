import { createContext, useState, useEffect } from 'react';
import API from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await API.post('/auth/login', { email, password });
            
            // Backend se res.data.user ya res.data me se user object extract karna
            const userData = res.data.user || res.data;
            const token = res.data.token;

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return res.data;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await API.post('/auth/register', { name, email, password });
            console.log("Registration response:", res.data);

            const userData = res.data.user || res.data;
            const token = res.data.token;

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }
            return res.data;
        } catch (err) {
            console.error('Registration failed:', err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        // 💡 FIX: Added `register` here in context value!
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};