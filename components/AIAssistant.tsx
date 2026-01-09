
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { GeoLocation } from '../types';

interface Props {
  history: any[];
  userLoc: GeoLocation | null;
}

const AIAssistant: React.FC<Props> = ({ history, userLoc }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    const analysis = await geminiService.analyzeAttendance(history);
    setResponse(analysis);
    setLoading(false);
  };

  const handleCustomPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    // Simulate simple Q&A for the demo
    const analysis = await geminiService.lookupOffice(prompt, userLoc || undefined);
    setResponse(analysis.text);
    setLoading(false);
    setPrompt('');
  };

  return (
    <div className="bg-indigo-900 rounded-3xl shadow-xl p-6 text-white overflow-hidden relative border border-indigo-800">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Attendance Assistant</h3>
            <p className="text-indigo-300 text-xs">Powered by Gemini 3 Pro</p>
          </div>
        </div>

        {response ? (
          <div className="space-y-4">
             <div className="bg-indigo-800/50 p-4 rounded-2xl border border-indigo-700 text-sm leading-relaxed text-indigo-50 max-h-60 overflow-y-auto whitespace-pre-wrap">
               {response}
             </div>
             <button 
               onClick={() => setResponse(null)}
               className="w-full py-3 bg-indigo-700 hover:bg-indigo-600 rounded-xl text-xs font-bold transition-colors"
             >
               Dismiss Response
             </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-indigo-200">
              Get an AI analysis of your work patterns, or search for office locations and amenities using Gemini's Maps grounding.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleAnalyze}
                disabled={loading || history.length === 0}
                className="w-full py-4 px-6 bg-white text-indigo-900 rounded-2xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                   <div className="w-5 h-5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    Analyze My Logs
                  </>
                )}
              </button>
              
              <form onSubmit={handleCustomPrompt} className="relative">
                <input 
                  type="text"
                  placeholder="Ask Gemini about locations..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-indigo-800/50 border border-indigo-700 rounded-2xl py-4 pl-4 pr-12 text-sm text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-700 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-400 rounded-full blur-2xl opacity-20"></div>
    </div>
  );
};

export default AIAssistant;
