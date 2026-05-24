import React from 'react';
import { Activity } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import { LeadStatus } from '../types';

export default function PipelineBoard() {
  const {
    leads,
    totalLeadsCount,
    newLeadsCount,
    contactedLeadsCount,
    qualifiedLeadsCount,
    wonLeadsCount,
    lostLeadsCount,
    winRatePercentage,
  } = useLeads();

  const totalPipelineSum = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const wonPipelineSum = leads.filter(l => l.status === LeadStatus.WON).reduce((sum, l) => sum + (l.dealValue || 0), 0);

  return (
    <div id="kpi-panel" className="bg-white border border-slate-105 rounded-2xl p-6 shadow-xs">
      {/* Block Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-slate-805 flex items-center gap-2">
          <Activity className="h-5 w-5 text-slate-400" />
          Метрики и Воронка продаж
        </h3>
        <span className="text-xs text-slate-400 font-mono">MVP Dashboard</span>
      </div>

      {/* KPI Stats Blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Всего Заявок</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-800">{totalLeadsCount}</span>
            <span className="text-xs text-blue-500 font-medium">100%</span>
          </div>
        </div>

        <div className="bg-blue-50/20 rounded-xl p-3 border border-blue-100/30">
          <p className="text-[10px] text-blue-600 uppercase font-semibold">В работе</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-blue-800">
              {newLeadsCount + contactedLeadsCount}
            </span>
            <span className="text-xs text-blue-600 font-semibold">
              {totalLeadsCount > 0 ? Math.round(((newLeadsCount + contactedLeadsCount) / totalLeadsCount) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-purple-50/20 rounded-xl p-3 border border-purple-100/30">
          <p className="text-[10px] text-purple-600 uppercase font-semibold">Квалификация</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-purple-800">{qualifiedLeadsCount}</span>
            <span className="text-xs text-purple-600 font-semibold">
              {totalLeadsCount > 0 ? Math.round((qualifiedLeadsCount / totalLeadsCount) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-emerald-50/20 rounded-xl p-3 border border-emerald-100/30">
          <p className="text-[10px] text-emerald-600 uppercase font-semibold">Закрыто</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-800">{wonLeadsCount}</span>
            <span className="text-xs text-emerald-600 font-bold">CR: {winRatePercentage}%</span>
          </div>
        </div>
      </div>

      {/* Sales Pipeline Values */}
      <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50/40 border border-slate-100 p-3.5 rounded-xl">
        <div id="pipeline-total-container">
          <p className="text-[10px] text-slate-500 uppercase font-semibold">Общая ценность воронки</p>
          <p className="text-base font-bold text-slate-800 mt-0.5">
            {totalPipelineSum.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        <div id="pipeline-revenue-container">
          <p className="text-[10px] text-emerald-600 uppercase font-semibold">Выигранная выручка</p>
          <p className="text-base font-bold text-emerald-700 mt-0.5">
            {wonPipelineSum.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      {/* Visual Funnel Stack ProgressBar */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${totalLeadsCount > 0 ? (newLeadsCount / totalLeadsCount) * 100 : 0}%` }} 
            className="bg-blue-500 h-full transition-all duration-300" 
          />
          <div 
            style={{ width: `${totalLeadsCount > 0 ? (contactedLeadsCount / totalLeadsCount) * 100 : 0}%` }} 
            className="bg-amber-500 h-full transition-all duration-300" 
          />
          <div 
            style={{ width: `${totalLeadsCount > 0 ? (qualifiedLeadsCount / totalLeadsCount) * 100 : 0}%` }} 
            className="bg-purple-500 h-full transition-all duration-300" 
          />
          <div 
            style={{ width: `${totalLeadsCount > 0 ? (wonLeadsCount / totalLeadsCount) * 100 : 0}%` }} 
            className="bg-teal-500 h-full transition-all duration-300" 
          />
          <div 
            style={{ width: `${totalLeadsCount > 0 ? (lostLeadsCount / totalLeadsCount) * 100 : 0}%` }} 
            className="bg-rose-500 h-full transition-all duration-300" 
          />
        </div>
        
        {/* Progress bar labels */}
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono flex-wrap gap-y-1">
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 bg-blue-500 rounded-full" /> 
            Новые ({newLeadsCount})
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" /> 
            Контакт ({contactedLeadsCount})
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 bg-purple-500 rounded-full" /> 
            Квал ({qualifiedLeadsCount})
          </span>
          <span className="flex items-center gap-1.5 shrink-0">
            <span className="h-1.5 w-1.5 bg-teal-500 rounded-full" /> 
            Сделка выиграна ({wonLeadsCount})
          </span>
          <span className="flex items-center gap-1.5 shrink-0 font-sans text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded font-medium">
            Lost ({lostLeadsCount})
          </span>
        </div>
      </div>
    </div>
  );
}
