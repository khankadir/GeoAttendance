
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService.ts';
import { storageService } from '../services/storageService.ts';
import { GeoLocation, OfficeConfig } from '../types.ts';
import { DEFAULT_RADIUS } from '../constants.ts';

interface Props {
  onComplete: () => void;
  userLoc: GeoLocation | null;
}

const OfficeSetup: React.FC<Props> = ({ onComplete, userLoc }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; urls: any[] } | null>(null);
  const [parsingStep, setParsingStep] = useState(false);
  const [selectedLoc, setSelectedLoc] = useState<GeoLocation | null>(null);
  const [officeName, setOfficeName] = useState('');
  const [radius, setRadius] = useState(DEFAULT_RADIUS);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const res = await geminiService.lookupOffice(query, userLoc || undefined);
    setResult({ text: res.text, urls: res.groundingUrls || [] });
    setParsingStep(true);
    setLoading(false);
    setOfficeName(query);
  };

  const handleCaptureLocation = () => {
    if (userLoc) {
      setSelectedLoc(userLoc);
    } else {
      alert("Unable to detect your current location. Please ensure GPS is enabled.");
    }
  };

  const handleSave = () => {
    if (!selectedLoc || !officeName) {
      alert("Please capture your location and provide an office name.");
      return;
    }

    const office: OfficeConfig = {
      name: officeName,
      address: query || officeName,
      location: selectedLoc,
      radius: radius
    };

    storageService.saveOffice(office);
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300">
      <div className="bg-indigo-600 px-8 py-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Setup Your Office</h2>
          <p className="text-indigo-100 text-lg">Pinpoint your workspace boundary using GPS and AI assistance.</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {!parsingStep ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Office Name or Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Acme Corp HQ..."
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-slate-800"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                >
                  {loading ? (
                    <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  )}
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM5.879 4.464a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zM17.657 5.879a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM10 8a2 2 0 100 4 2 2 0 000-4zM11 13a1 1 0 10-2 0v1a1 1 0 102 0v-1zM5.879 14.121l-.707.707a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414zM15.536 14.121l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM15 10a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" /></svg>
                Gemini assists in validating your office identity.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Office Context</h4>
                <p className="text-slate-700 text-sm mb-4">
                  Confirm the location of <strong>{officeName}</strong>. For precision, we recommend standing at the center of your office and clicking the "Capture" button.
                </p>
                {result?.urls && result.urls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.urls.map((u, i) => (
                      <a key={i} href={u.uri} target="_blank" rel="noreferrer" className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1">
                        View on Map
                      </a>
                    ))}
                  </div>
                )}
             </div>

             <div className="space-y-6">
                <div className="flex flex-col gap-4">
                   <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between border-l-4 border-indigo-500 shadow-inner">
                      <div>
                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter mb-1">Target Coordinates</p>
                        <p className="font-mono text-lg">
                          {selectedLoc 
                            ? `${selectedLoc.latitude.toFixed(6)}, ${selectedLoc.longitude.toFixed(6)}` 
                            : 'Coordinates not yet set'}
                        </p>
                      </div>
                      <div className={`p-2 rounded-full ${selectedLoc ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                   </div>

                   <button 
                     onClick={handleCaptureLocation}
                     className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-indigo-100 hover:bg-indigo-100 transition-all group"
                   >
                     <svg className="w-5 h-5 group-hover:animate-ping" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     Capture My Current GPS Position
                   </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-widest">Office Nickname</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Main HQ" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={officeName} 
                      onChange={e => setOfficeName(e.target.value)} 
                    />
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-widest">Attendance Radius</label>
                    <div className="flex items-center gap-6">
                       <input 
                         type="range" 
                         min="50" 
                         max="1000" 
                         step="50" 
                         className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" 
                         value={radius} 
                         onChange={e => setRadius(parseInt(e.target.value))} 
                       />
                       <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-black text-sm">
                         {radius}m
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setParsingStep(false)} 
                    className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Go Back
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={!selectedLoc}
                    className="flex-[2] py-4 px-6 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none hover:-translate-y-1 transition-all"
                  >
                    Complete Office Setup
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeSetup;
