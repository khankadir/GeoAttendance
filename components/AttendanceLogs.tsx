
import React from 'react';
import { AttendanceRecord } from '../types';

interface Props {
  records: AttendanceRecord[];
}

const AttendanceLogs: React.FC<Props> = ({ records }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
        <button className="text-xs font-semibold text-indigo-600 hover:underline">View All Logs</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Method</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Coordinates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No attendance records found.</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${record.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${record.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      {record.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-700">{new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-xs text-slate-400">{new Date(record.timestamp).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {record.isAuto ? 'Auto' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                    {record.location.latitude.toFixed(4)}, {record.location.longitude.toFixed(4)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceLogs;
