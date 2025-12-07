import React, { useState } from 'react';
import useStore from '../store/useStore';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.user) {
                onLogin(data.user, data.token);
            }
        } catch (err) {
            alert('Login failed. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96 border border-slate-700">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    StockDash
                </h2>
                <div className="mb-6">
                    <label className="block text-slate-400 mb-2 text-sm">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
                        placeholder="trader@example.com"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                    {loading ? 'Entering...' : 'Enter Dashboard'}
                </button>
            </form>
        </div>
    );
};

export default Login;
