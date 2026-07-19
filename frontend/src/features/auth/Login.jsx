import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // AuthContext se login function nikal rahe hain
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(email, password);
            if (data) {
            console.log('Login Successful! Backend se data aaya:', data);
            alert('Launde Login Ho Gaya! Inspect karke Application tab check kar.');
        }
            
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Kuch toh gadbad hai boss!');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
            <form onSubmit={handleSubmit} className="p-8 bg-slate-900 rounded-xl shadow-lg border border-slate-800 w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">PeerPool Login</h2>
                
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-cyan-400"
                        required 
                    />
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-cyan-400"
                        required 
                    />
                </div>
                
                <button type="submit" className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 font-bold rounded transition">
                    Let's Go 
                </button>
            </form>
        </div>
    );
}

export default Login;
