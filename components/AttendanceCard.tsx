
import React from 'react';
import { formatDistance } from '../utils/geoUtils';

interface Props {
  status: string;
  officeName: string;
  distance: number | null;
  radius: number;
  isAtOffice: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

const AttendanceCard: React.FC<Props> = ({ 
  status, 
  officeName, 
  distance, 
  radius, 
  isAtOffice, 
  onCheckIn, 
  onCheckOut 
}) => {
  const isCheckedIn = status === 'Checked In';

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{officeName}</h2>
            <p className="text-slate-500 flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              {isAtOffice ? 'Within geofence' : 'Outside boundary'}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isCheckedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {status}
            </span>
            <p className="text-xs text-slate-400 mt-2">Current Status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-5">
             <div className="bg-white p-3 rounded-xl shadow-sm">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
             </div>
             <div>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Distance</p>
               <p className="text-2xl font-black text-slate-800">{distance !== null ? formatDistance(distance) : '--'}</p>
             </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-5">
             <div className="bg-white p-3 rounded-xl shadow-sm">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
             </div>
             <div>
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Allowed Radius</p>
               <p className="text-2xl font-black text-slate-800">{radius}m</p>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
           {isCheckedIn ? (
             <button 
               onClick={onCheckOut}
               className="flex-1 bg-white border-2 border-slate-200 text-slate-700 py-5 rounded-2xl font-bold text-lg hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group"
             >
               <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               Manual Check Out
             </button>
           ) : (
             <button 
               onClick={onCheckIn}
               disabled={!isAtOffice}
               className={`flex-1 py-5 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 group ${isAtOffice ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'}`}
             >
               <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               {isAtOffice ? 'Check In to Office' : 'Check In Unavailable'}
             </button>
           )}
        </div>
        {!isAtOffice && !isCheckedIn && (
          <p className="mt-4 text-center text-sm text-rose-500 font-medium">
            You must be within {radius}m of the office to check in.
          </p>
        )}
      </div>
      <div className={`h-2 w-full ${isAtOffice ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
    </div>
  );
};

export default AttendanceCard;
