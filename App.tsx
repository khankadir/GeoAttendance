
import React, { useState, useEffect, useCallback } from 'react';
import { storageService } from './services/storageService.ts';
import { UserState, GeoLocation, AttendanceRecord } from './types.ts';
import { calculateDistance, formatDistance } from './utils/geoUtils.ts';
import OfficeSetup from './components/OfficeSetup.tsx';
import AttendanceCard from './components/AttendanceCard.tsx';
import AttendanceLogs from './components/AttendanceLogs.tsx';
import AIAssistant from './components/AIAssistant.tsx';

const App: React.FC = () => {
  const [appState, setAppState] = useState<UserState>(storageService.getData());
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshState = useCallback(() => {
    setAppState(storageService.getData());
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        setError("Location access denied. Please enable GPS.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleRecordAttendance = (type: 'IN' | 'OUT', isAuto: boolean = false) => {
    if (!currentLocation) return;
    
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      location: currentLocation,
      isAuto
    };

    storageService.addRecord(newRecord);
    refreshState();
  };

  const distanceToOffice = appState.office && currentLocation 
    ? calculateDistance(currentLocation, appState.office.location)
    : null;

  const isAtOffice = appState.office && distanceToOffice !== null 
    ? distanceToOffice <= appState.office.radius 
    : false;

  const lastRecord = appState.history[0];
  const currentStatus = lastRecord?.type === 'IN' ? 'Checked In' : 'Checked Out';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">GeoAttend <span className="text-indigo-600">AI</span></h1>
          </div>
          <div className="flex items-center gap-3">
             {isLocating && (
               <span className="text-xs text-slate-500 animate-pulse flex items-center gap-1">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                 Locating...
               </span>
             )}
             <button 
               onClick={() => { storageService.clearData(); window.location.reload(); }}
               className="text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
             >
               Reset App
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!appState.isConfigured ? (
          <OfficeSetup onComplete={refreshState} userLoc={currentLocation} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AttendanceCard 
                status={currentStatus}
                officeName={appState.office?.name || 'Office'}
                distance={distanceToOffice}
                radius={appState.office?.radius || 200}
                isAtOffice={isAtOffice}
                onCheckIn={() => handleRecordAttendance('IN')}
                onCheckOut={() => handleRecordAttendance('OUT')}
              />
              <AttendanceLogs records={appState.history} />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                 <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                   <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   Location Context
                 </h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Current Position</span>
                      <span className="text-sm font-mono text-slate-700">
                        {currentLocation ? `${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}` : 'Detecting...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-500">Target Radius</span>
                      <span className="text-sm font-medium text-slate-700">{appState.office?.radius}m</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-500">Auto-Attendance</span>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">ENABLED</span>
                    </div>
                 </div>
              </div>
              <AIAssistant history={appState.history} userLoc={currentLocation} />
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status Bar */}
      <footer className="bg-white border-t border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <p>© 2024 GeoAttend AI - Intelligent Office Presence Management</p>
          <div className="flex gap-4">
            <span>Powered by Gemini 3 Pro</span>
            <span className="flex items-center gap-1">
               <div className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
               GPS: {currentLocation ? 'Active' : 'Offline'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
