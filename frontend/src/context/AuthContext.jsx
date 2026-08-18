import { createContext, useState, useEffect } from 'react';
import API from '../services/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await API.post('/auth/login', { 
                email: email.trim(), 
                password 
            });
            
            const { token, user: userData } = res.data;

            if (token) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
            }
            return res.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await API.post('/auth/register', { 
                name: name.trim(), 
                email: email.trim(), 
                password 
            });

            const { token, user: userData } = res.data;

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
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};