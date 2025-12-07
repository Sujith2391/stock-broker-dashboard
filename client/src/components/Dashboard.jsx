import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import useStore from '../store/useStore';
import StockCard from './StockCard';
import { Settings, LogOut, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

const SUPPORTED_TICKERS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const socket = io(API_URL, { autoConnect: false });

const Dashboard = () => {
    const { user, logout, subscribedTickers, setSubscriptions, prices, updatePrice } = useStore();
    const [isManaging, setIsManaging] = useState(false);

    // Initial Load & Socket Setup
    useEffect(() => {
        // 1. Fetch initial subscriptions
        fetch(`${API_URL}/subscriptions/${user.id}`)
            .then(res => res.json())
            .then(data => setSubscriptions(data));

        // 2. Connect Socket
        socket.auth = { userId: user.id };
        socket.connect();
        socket.emit('join_user', user.id);

        // 3. Listen for prices
        socket.on('price_update', (data) => {
            updatePrice(data.ticker, data);
        });

        return () => {
            socket.off('price_update');
            socket.disconnect();
        };
    }, [user.id]);

    const handleToggle = async (ticker) => {
        // Toggle Locally for instant feedback (optimistic)
        // Then call API
        try {
            const res = await fetch(`${API_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, ticker })
            });
            const data = await res.json();
            if (data.active) {
                setSubscriptions(data.active);
                // Socket Join/Leave is handled by Backend? 
                // Wait, backend logic: socket.on('subscribe') needs to be called manually if logic isn't shared?
                // The backend API doesn't sync with the socket instance directly easily without Redis/Emitter across processes.
                // In my server.js, I didn't link the Subscription API to the Socket room logic automatically for *active* sockets.
                // So I MUST emit 'subscribe'/'unsubscribe' from client too.

                if (data.action === 'added') {
                    socket.emit('subscribe', ticker);
                } else {
                    socket.emit('unsubscribe', ticker);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Market Dashboard</h1>
                    <p className="text-slate-400">Welcome back, <span className="text-blue-400">{user.email}</span></p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsManaging(!isManaging)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
                    >
                        <Settings size={18} />
                        {isManaging ? 'Done' : 'Manage Feed'}
                    </button>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg border border-red-900/50 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </header>

            {/* Subscription Manager (Conditional) */}
            {isManaging && (
                <div className="mb-8 bg-slate-800/50 p-6 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Manage Subscriptions</h3>
                    <div className="flex flex-wrap gap-3">
                        {SUPPORTED_TICKERS.map(t => {
                            const isActive = subscribedTickers.includes(t);
                            return (
                                <button
                                    key={t}
                                    onClick={() => handleToggle(t)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full border transition-all
                                        ${isActive
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
                                    `}
                                >
                                    {isActive ? <CheckCircle size={16} /> : <PlusCircle size={16} />}
                                    {t}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Grid */}
            {subscribedTickers.length === 0 ? (
                <div className="text-center py-20 bg-slate-800/20 rounded-xl border border-slate-800 border-dashed">
                    <div className="text-slate-500 mb-4">No active subscriptions</div>
                    <button onClick={() => setIsManaging(true)} className="text-blue-400 hover:underline">Add stocks to your feed</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscribedTickers.map(ticker => (
                        <StockCard key={ticker} ticker={ticker} priceData={prices[ticker]} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
