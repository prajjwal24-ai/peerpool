import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Navigate import kiya
import { AuthContext } from '../../context/AuthContext';
import Galaxy from '../../components/ui/Galaxy';

function Login({ onSwitch }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // 2. Loading state

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const data = await login(email, password);
            if (data) {
                console.log('Login Successful! Data:', data);
                navigate('/');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Invalid Email or Password!');
        } finally {
            setIsSubmitting(false);
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

            {/* Login Form Container (Glassmorphism Effect) */}
            <form 
                onSubmit={handleSubmit} 
                className="relative z-10 p-8 bg-slate-900/60 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-800/80 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        PeerPool
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Welcome back! Please enter your details.</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}

                <div className="mb-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        Email Address
                    </label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
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
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-sm"
                        required 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform active:scale-[0.98]"
                >
                    {isSubmitting ? 'Signing In... ⚡' : 'Sign In 🚀'}
                </button>

                <p className="mt-6 text-sm text-center text-slate-400">
                    Don't have an account?{' '}
                    <span 
                        onClick={onSwitch} 
                        className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline underline-offset-4"
                    >
                        Create Account
                    </span>
                </p>
            </form>
        </div>
    );
}

export default Login;