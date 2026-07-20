import { useState } from 'react';
import API from '../../services/api';
import Galaxy from '../../components/ui/Galaxy';

function Register({ onSwitch }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await API.post('/auth/register', formData);
            setSuccess('Account successfully ban gaya! Ab Sign In kar lo.');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed!');
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4 overflow-hidden">
            
            {/* 🌌 REACT BITS GALAXY BACKGROUND */}
            <Galaxy 
                mouseRepulsion={true}
                mouseInteraction={true}
                density={1.2}
                glowIntensity={0.6}
                saturation={0.8}
                hueShift={200}
                twinkleIntensity={0.5}
                rotationSpeed={0.05}
                transparent={true}
            />

            {/* Register Form Container (Glassmorphism Effect) */}
            <form 
                onSubmit={handleSubmit} 
                className="relative z-10 p-8 bg-slate-900/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-800/80 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Join PeerPool
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Start your journey with us today.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm p-3 rounded-lg mb-6 text-center">
                        {success}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Full Name
                    </label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        placeholder="Prajjwal"
                        className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                        required 
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                        required 
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Password
                    </label>
                    <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.98]"
                >
                    Create Account ✨
                </button>

                <p className="mt-6 text-sm text-center text-slate-400">
                    Already have an account?{' '}
                    <span 
                        onClick={onSwitch} 
                        className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline underline-offset-4"
                    >
                        Sign In
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Register;