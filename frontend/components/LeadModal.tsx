import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useLeads, STATUS_DETAILS } from '../context/LeadContext';
import { LeadStatus } from '../types';

export default function LeadModal() {
  const { 
    activeStatusSelectLead, 
    setActiveStatusSelectLead, 
    updateLeadStatus 
  } = useLeads();

  if (!activeStatusSelectLead) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-4">
        {/* Click outside to close backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActiveStatusSelectLead(null)}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: "100%", opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="relative bg-white border border-slate-100 shadow-2xl rounded-t-3xl sm:rounded-3xl w-full max-w-sm overflow-hidden z-10 p-5 space-y-4"
        >
          {/* Top Handle for mobile bottom-sheet visual */}
          <div className="sm:hidden flex justify-center mb-1">
            <div className="w-12 h-1 bg-slate-200 rounded-full" />
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="space-y-0.5">
              <h4 className="font-bold text-sm text-slate-900 tracking-tight">
                Сменить статус заявки
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">
                Лид {activeStatusSelectLead.id} &bull; {activeStatusSelectLead.name}
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setActiveStatusSelectLead(null)}
              className="p-1.5 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Status choices list */}
          <div className="space-y-1.5">
            {Object.values(LeadStatus).map((statusValue) => {
              const isSelected = activeStatusSelectLead.status === statusValue;
              const details = STATUS_DETAILS[statusValue];

              return (
                <button
                  key={statusValue}
                  type="button"
                  onClick={() => {
                    updateLeadStatus(activeStatusSelectLead.id, statusValue);
                    setActiveStatusSelectLead(null);
                  }}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    isSelected 
                      ? `${details.activeBg}` 
                      : `bg-slate-50/50 hover:bg-white border-transparent hover:border-slate-150`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0 group-hover:scale-110 transition-transform duration-200">
                      {details.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {details.label}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">
                        {statusValue}
                      </span>
                    </div>
                  </div>

                  {/* Radio Choice Toggle representing user screenshot styling */}
                  <div className="flex items-center gap-2">
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? `border-slate-900` 
                        : 'border-slate-200 group-hover:border-slate-300'
                    }`}>
                      {isSelected && (
                        <motion.div 
                          layoutId="active-dot"
                          className="h-2.5 w-2.5 rounded-full bg-slate-950" 
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
