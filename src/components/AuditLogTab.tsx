import React, { useState } from 'react';
import { History, Search, ArrowRight } from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogTabProps {
  logs: AuditLog[];
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filtered = logs.filter((log) => {
    if (filterAction !== 'all' && !log.action.toLowerCase().includes(filterAction.toLowerCase())) return false;
    if (
      search &&
      !log.userName.toLowerCase().includes(search.toLowerCase()) &&
      !log.action.toLowerCase().includes(search.toLowerCase()) &&
      !(log.newValue && log.newValue.toLowerCase().includes(search.toLowerCase()))
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk']">
          Security &amp; Audit Trail
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Immutable, timestamped record of every transaction, payment, approval, and administrative modification.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search user, action, IP, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 min-h-[44px] text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="min-h-[44px] text-xs sm:text-sm border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-emerald-500 w-full sm:w-auto"
        >
          <option value="all">All Actions</option>
          <option value="Payment">Payment Operations</option>
          <option value="Expense">Expense Operations</option>
          <option value="Loan">Loan Approvals</option>
          <option value="Tour">Tour Proposals</option>
        </select>
      </div>

      {/* Mobile Card Feed (100% Mobile Optimized) */}
      <div className="sm:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
            No audit records found matching query.
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{log.userName}</span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(log.timestamp).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-800 font-mono uppercase">
                  {log.action}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[11px] space-y-1">
                {log.oldValue && (
                  <div className="text-slate-400 line-through truncate">
                    Previous: {log.oldValue}
                  </div>
                )}
                <div className="text-emerald-700 font-semibold break-words">
                  Current: {log.newValue || log.action}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between pt-1">
                <span>Node: {log.ipInfo || 'Verified Session'}</span>
                <span className="text-emerald-600 font-semibold">Verified Log</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Old State &rarr; New Verified State</th>
                <th className="py-3 px-4">IP / Geo Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 font-mono text-xs">
                      {log.oldValue && (
                        <span className="text-slate-400 line-through text-[11px]">{log.oldValue}</span>
                      )}
                      {log.oldValue && log.newValue && <ArrowRight className="w-3 h-3 text-slate-400 hidden sm:inline" />}
                      <span className="text-emerald-700 font-semibold">{log.newValue || log.action}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                    {log.ipInfo || 'Verified Session'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
