import React from 'react';
import { Search, X, Sliders, AlertCircle, Plus } from 'lucide-react';
import { useLeads, STATUS_DETAILS } from '../context/LeadContext';
import { LeadStatus } from '../types';
import LeadCard from './LeadCard';
import LeadForm from './LeadForm';
import { AnimatePresence } from 'motion/react';

export default function LeadTable() {
  const {
    leads,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    leadsFiltered,
    setShowAdd,
  } = useLeads();

  return (
    <div id="workspace-controls" className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-gray-100 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-slate-400" />
          Базовая CRM Таблица
        </h4>
        <button
          id="btn-open-add-lead"
          type="button"
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-slate-950 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <Plus className="h-4 w-4" />
          Создать Заявку
        </button>
      </div>

      {/* Filter panel */}
      <div className="p-4 bg-white border-b border-slate-50 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            id="search-leads-input"
            type="text"
            placeholder="Поиск по имени, телефону или ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-205"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery('')} 
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-650 cursor-pointer focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Horizontal Pill Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shrink-0 ${
              statusFilter === 'ALL'
                ? 'bg-slate-150 text-slate-850 border-slate-300'
                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
            }`}
          >
            Все ({leads.length})
          </button>
          {Object.values(LeadStatus).map((st) => {
            const count = leads.filter(l => l.status === st).length;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span>{STATUS_DETAILS[st].icon}</span>
                <span>{STATUS_DETAILS[st].label}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Insert Slide-down Lead Add Form */}
      <LeadForm />

      {/* Table Item Mapping */}
      <div className="divide-y divide-slate-100">
        {leadsFiltered.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-medium">Заявок не найдено</p>
            <p className="text-slate-400 text-xs mt-1">Попробуйте скорректировать поисковый запрос.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {leadsFiltered.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
