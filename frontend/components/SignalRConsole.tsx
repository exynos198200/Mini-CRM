import React from 'react';
import { Wifi, WifiOff, Plus, RefreshCw, Database } from 'lucide-react';
import { useLeads } from '../context/LeadContext';

export default function SignalRConsole() {
  const {
    isLive,
    setIsLive,
    logs,
    simulateRealtimeEvent,
    resetDatabase,
    onlineManagers,
  } = useLeads();

  return (
    <div id="signalr-console" className="space-y-6">
      {/* Visual Terminal Panel */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[525px]">
        {/* Terminal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex shrink-0">
              <span className={`block h-2.5 w-2.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {isLive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 top-0 left-0" />
              )}
            </div>
            <div>
              <h4 className="font-mono text-xs font-bold text-slate-200 flex items-center gap-2">
                SignalR Hub Monitor
                {isLive && (
                  <span className="text-[10px] text-emerald-400 font-normal bg-emerald-550/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                    {onlineManagers} в сети
                  </span>
                )}
              </h4>
              <p className="text-[10px] font-mono text-slate-500">
                /hubs/leads (WebSockets)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer focus:outline-none ${
              isLive 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            {isLive ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Simulation operations bar */}
        <div className="p-3 bg-slate-900/30 border-b border-slate-800/50 flex flex-col gap-2">
          <p className="text-[10px] font-mono text-slate-400">Симуляция фоновой активности (WebSockets/SignalR):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={simulateRealtimeEvent}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1 transition-colors border border-slate-700 cursor-pointer focus:outline-none"
            >
              <Plus className="h-3.5 w-3.5 text-blue-400" />
              Симулировать Лид
            </button>
            <button
              type="button"
              onClick={resetDatabase}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-mono flex items-center justify-center gap-1 transition-colors border border-slate-700 cursor-pointer focus:outline-none"
            >
              <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
              Сбросить БД
            </button>
          </div>
        </div>

        {/* Log rows streaming output */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-3.5 select-none">
          {logs.map((log) => {
            let tagStyle = 'text-blue-400 bg-blue-500/10';
            if (log.type === 'STATUS_CHANGED') tagStyle = 'text-amber-400 bg-amber-500/10';
            if (log.type === 'LEAD_DELETED') tagStyle = 'text-rose-400 bg-rose-500/10';
            if (log.type === 'COMMENT_ADDED') tagStyle = 'text-purple-400 bg-purple-500/10';

            return (
              <div key={log.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${tagStyle}`}>
                    {log.type}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">{log.message}</p>
              </div>
            );
          })}
        </div>

        {/* Console status footer */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Terminal: logs streaming active</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
            PORT 3000 &rarr; 5000 Proxy
          </span>
        </div>
      </div>

      {/* Sync architecture info card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800">
          <Database className="h-5 w-5 text-slate-450" />
          <span className="font-semibold text-sm">Связь Front-Back (MVP)</span>
        </div>
        <p className="text-xs text-slate-650 leading-relaxed font-sans">
          В реальном стеке фронтенд-клиент делает REST HTTP-запросы ко второму слою (.NET WebAPI Controller), который через EF Core синхронизирует состояние в PostgreSQL. 
        </p>
        <div className="bg-white rounded-xl p-3 border border-slate-150 text-xs text-slate-500 space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>DB Engine:</span>
            <span className="text-slate-750 font-semibold">PostgreSQL 16</span>
          </div>
          <div className="flex justify-between">
            <span>ORM Framework:</span>
            <span className="text-slate-750 font-semibold">EF Core 8</span>
          </div>
          <div className="flex justify-between">
            <span>REST Client:</span>
            <span className="text-slate-750 font-semibold">Axios + React Query</span>
          </div>
          <div className="flex justify-between">
            <span>WebSockets:</span>
            <span className="text-slate-750 font-semibold">@microsoft/signalr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
