import React, { useEffect } from 'react';
import useStore from './store/useStore';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
    const { user, login } = useStore();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased text-base">
            {!user ? (
                <Login onLogin={login} />
            ) : (
                <Dashboard />
            )}
        </div>
    );
}

export default App;
