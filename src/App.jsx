import React, { useState, useEffect } from 'react';
import LoginPage from './features/auth/LoginPage';
import NewDashboard from './features/dashboard/NewDashboard';
import FalconLoginPage from './features/falcon/FalconLoginPage';
import FalconDashboard from './features/falcon/FalconDashboard';

function App() {
  // Simple custom router path state: 'data-entry' | 'falcon-executive'
  const [appRoute, setAppRoute] = useState('data-entry');
  
  // Separate user authentication sessions
  const [dataEntryUser, setDataEntryUser] = useState(null);
  const [falconUser, setFalconUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // Read sessions from localStorage when the app boots up
  useEffect(() => {
    const savedDataEntryUser = localStorage.getItem('dataEntryUser');
    const savedFalconUser = localStorage.getItem('falconUser');
    const savedRoute = localStorage.getItem('appRoute');

    if (savedDataEntryUser) setDataEntryUser(JSON.parse(savedDataEntryUser));
    if (savedFalconUser) setFalconUser(JSON.parse(savedFalconUser));
    if (savedRoute) setAppRoute(savedRoute);
    
    setIsHydrating(false);
  }, []);

  // Save the current active workspace configuration view when flipped
  const handleRouteChange = (route) => {
    setAppRoute(route);
    localStorage.setItem('appRoute', route);
  };

  const handleDataEntryLogin = (user) => {
    setDataEntryUser(user);
    localStorage.setItem('dataEntryUser', JSON.stringify(user));
  };

  const handleDataEntrySignOut = () => {
    setDataEntryUser(null);
    localStorage.removeItem('dataEntryUser');
  };

  const handleFalconLogin = (user) => {
    setFalconUser(user);
    localStorage.setItem('falconUser', JSON.stringify(user));
  };

  const handleFalconSignOut = () => {
    setFalconUser(null);
    localStorage.removeItem('falconUser');
  };

  // Prevent flash content rendering while checking local storage status
  if (isHydrating) {
    return (
      <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen">
      
      {/* Route Switcher Toggle (Floating Admin Toolbar) */}
      <div className="absolute bottom-4 left-4 z-50 flex gap-2 bg-white/90 backdrop-blur border border-slate-200 p-1.5 rounded-xl shadow-lg select-none">
        <button
          onClick={() => handleRouteChange('data-entry')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            appRoute === 'data-entry'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Data Input Core
        </button>
        <button
          onClick={() => handleRouteChange('falcon-executive')}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
            appRoute === 'falcon-executive'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Falcon Executive View
        </button>
      </div>

      {/* Dynamic Route Rendering Conditionals */}
      {appRoute === 'data-entry' ? (
        !dataEntryUser ? (
          <LoginPage onLoginSuccess={handleDataEntryLogin} />
        ) : (
          <NewDashboard user={dataEntryUser} onSignOut={handleDataEntrySignOut} />
        )
      ) : (
        !falconUser ? (
          <FalconLoginPage onLoginSuccess={handleFalconLogin} />
        ) : (
          <FalconDashboard user={falconUser} onSignOut={handleFalconSignOut} />
        )
      )}

    </div>
  );
}

export default App;