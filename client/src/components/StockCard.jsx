import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Sparkline = ({ data, color, isUp }) => {
    if (data.length < 2) return null;

    // Normalize data for SVG
    const width = 120;
    const height = 40;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible opacity-80">
            <polyline
                fill="none"
                stroke={isUp ? "#10b981" : "#ef4444"}
                strokeWidth="2"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-md"
            />
            {/* Area fill */}
            <defs>
                <linearGradient id={`grad-${isUp ? 'up' : 'down'}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline
                fill={`url(#grad-${isUp ? 'up' : 'down'})`}
                stroke="none"
                points={`${points} ${width},${height} 0,${height}`}
            />
        </svg>
    );
};

const StockCard = ({ ticker, priceData }) => {
    const [history, setHistory] = useState([]);
    const prevPriceRef = useRef(priceData?.price);

    const currentPrice = parseFloat(priceData?.price || 0);
    const prevPrice = parseFloat(prevPriceRef.current || 0);
    const isUp = currentPrice >= prevPrice;

    useEffect(() => {
        if (priceData?.price) {
            prevPriceRef.current = currentPrice;
            setHistory(prev => {
                const newHistory = [...prev, parseFloat(priceData.price)];
                if (newHistory.length > 20) newHistory.shift();
                return newHistory;
            });
        }
    }, [priceData?.price]);

    if (!priceData) {
        return (
            <div className="bg-slate-800/40 backdrop-blur-md p-6 rounded-2xl border border-slate-700/50 animate-pulse h-48 flex items-center justify-center">
                <p className="text-slate-500 font-medium tracking-wide">Connecting...</p>
            </div>
        );
    }

    // Calculate percentage change (mock since we don't have open price)
    // We'll just use the difference from the first point in our local history for a "session change" effect
    const startPrice = history[0] || currentPrice;
    const pctChange = ((currentPrice - startPrice) / startPrice) * 100;

    return (
        <div className={`
      relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 transform hover:scale-[1.02]
      ${isUp
                ? 'bg-gradient-to-br from-slate-800/80 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-br from-slate-800/80 to-red-900/20 border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.3)]'}
      backdrop-blur-xl group
    `}>
            {/* Background Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight mb-1 drop-shadow-sm">{ticker}</h3>
                    <span className="text-xs text-slate-400 font-mono tracking-wider uppercase opacity-80">Real-Time Mrkt</span>
                </div>
                <div className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold shadow-inner 
            ${isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}
        `}>
                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(pctChange).toFixed(2)}%
                </div>
            </div>

            <div className="flex justify-between items-end relative z-10">
                <div className="flex flex-col">
                    <span className="text-sm text-slate-500 mb-1 block">Current Price</span>
                    <span className={`text-5xl font-mono font-bold tracking-tighter drop-shadow-lg ${isUp ? 'text-white' : 'text-white'}`}>
                        <span className="text-2xl align-top opacity-50 mr-1">$</span>
                        {currentPrice.toFixed(2)}
                    </span>
                </div>

                {/* Sparkline */}
                <div className="mb-1">
                    <Sparkline data={history} color={isUp ? 'emerald' : 'red'} isUp={isUp} />
                </div>
            </div>

            {/* Glow Effect on update */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${isUp ? 'bg-emerald-500/5' : 'bg-red-500/5'} ${priceData ? 'opacity-100' : 'opacity-0'}`} key={priceData.timestamp}></div>
        </div>
    );
};

export default StockCard;
