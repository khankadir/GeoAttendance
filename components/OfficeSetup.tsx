
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { GeoLocation, OfficeConfig } from '../types';
import { DEFAULT_RADIUS } from '../constants';

interface Props {
  onComplete: () => void;
  userLoc: GeoLocation | null;
}

const OfficeSetup: React.FC<Props> = ({ onComplete, userLoc }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; urls: any[] } | null>(null);
  const [parsingStep, setParsingStep] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: '', lng: '', name: '', radius: DEFAULT_RADIUS });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const res = await geminiService.lookupOffice(query, userLoc || undefined);
    setResult({ text: res.text, urls: res.groundingUrls || [] });
    setParsingStep(true);
    setLoading(false);
  };

  const handleManualSave = () => {
    if (!manualCoords.lat || !manualCoords.lng || !manualCoords.name) {
      alert("Please fill in all coordinates.");
      return;
    }

    const office: OfficeConfig = {
      name: manualCoords.name,
      address: query || manualCoords.name,
      location: {
        latitude: parseFloat(manualCoords.lat),
        longitude: parseFloat(manualCoords.lng)
      },
      radius: manualCoords.radius
    };

    storageService.saveOffice(office);
    onComplete();
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300">
      <div className="bg-indigo-600 px-8 py-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Setup Your Office</h2>
          <p className="text-indigo-100 text-lg">We use AI and Google Maps to pinpoint your workspace boundary.</p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {!parsingStep ? (
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Where is your office located?</label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Google Headquarters, Mountain View or 123 Main St..."
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
                Gemini uses Maps grounding for accurate coordinates.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Intelligence Report</h4>
                <div className="text-slate-700 text-sm whitespace-pre-wrap mb-4">
                  {result?.text}
                </div>
                {result?.urls && result.urls.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.urls.map((u, i) => (
                      <a key={i} href={u.uri} target="_blank" rel="noreferrer" className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" /></svg>
                        {u.title}
                      </a>
                    ))}
                  </div>
                )}
             </div>

             <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Confirm Office Details</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2">
                     <label className="text-xs font-medium text-slate-500 mb-1 block">Office Nickname</label>
                     <input type="text" placeholder="e.g. Main HQ" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" value={manualCoords.name} onChange={e => setManualCoords({...manualCoords, name: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-medium text-slate-500 mb-1 block">Latitude</label>
                     <input type="number" placeholder="0.0000" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" value={manualCoords.lat} onChange={e => setManualCoords({...manualCoords, lat: e.target.value})} />
                   </div>
                   <div>
                     <label className="text-xs font-medium text-slate-500 mb-1 block">Longitude</label>
                     <input type="number" placeholder="0.0000" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl" value={manualCoords.lng} onChange={e => setManualCoords({...manualCoords, lng: e.target.value})} />
                   </div>
                   <div className="col-span-2">
                     <label className="text-xs font-medium text-slate-500 mb-1 block">Attendance Radius (meters)</label>
                     <div className="flex items-center gap-4">
                        <input type="range" min="50" max="1000" step="50" className="flex-1 accent-indigo-600" value={manualCoords.radius} onChange={e => setManualCoords({...manualCoords, radius: parseInt(e.target.value)})} />
                        <span className="text-sm font-bold text-slate-700 w-12">{manualCoords.radius}m</span>
                     </div>
                   </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setParsingStep(false)} className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Go Back</button>
                  <button onClick={handleManualSave} className="flex-[2] py-4 px-6 rounded-2xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all">Save Office Configuration</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficeSetup;
