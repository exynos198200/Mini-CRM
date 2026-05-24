import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Phone, MessageSquare, ChevronDown, Trash2 } from 'lucide-react';
import { Lead } from '../types';
import { useLeads, STATUS_DETAILS } from '../context/LeadContext';

interface LeadCardProps {
  lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  const { saveLeadComment, deleteLead, setActiveStatusSelectLead } = useLeads();
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(lead.comment || '');

  const handleSave = () => {
    saveLeadComment(lead.id, editingText);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 last:border-b-0"
    >
      <div className="space-y-2.5 flex-1 w-full">
        {/* Header Actions & Tags */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
            {lead.id}
          </span>
          <h5 className="text-sm font-semibold text-slate-900">
            {lead.name}
          </h5>

          {lead.dealValue !== undefined && (
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 rounded flex items-center gap-1">
              <span>₽</span>
              <span>{lead.dealValue.toLocaleString('ru-RU')}</span>
            </span>
          )}
          
          <div className={`text-[10px] font-bold tracking-wider px-2 py-0.5 border rounded-full flex items-center gap-1 ${STATUS_DETAILS[lead.status].pillClass}`}>
            <span>{STATUS_DETAILS[lead.status].icon}</span>
            <span>{STATUS_DETAILS[lead.status].label}</span>
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 ml-auto md:ml-0">
            <Clock className="h-3 w-3" />
            {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
            {new Date(lead.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Client Metadata */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            <a href={`tel:${lead.phone}`} className="hover:underline hover:text-blue-500 font-mono">
              {lead.phone}
            </a>
          </span>
        </div>

        {/* Comment Node */}
        <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 relative">
          <div className="flex items-start justify-between gap-1 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Комментарий менеджера:
            </span>
            
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setEditingText(lead.comment || '');
                  setIsEditing(true);
                }}
                className="text-[10px] text-blue-500 hover:underline hover:text-blue-600 cursor-pointer focus:outline-none"
              >
                Изменить
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2 mt-1">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full text-xs p-2 bg-white border border-slate-250 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-700 font-sans"
                rows={2}
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-[10px] rounded text-slate-600 cursor-pointer"
                >
                  Сбросить
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-2.5 py-0.5 bg-slate-900 hover:bg-slate-800 text-[10px] rounded text-white cursor-pointer"
                >
                  Сохранить
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{lead.comment || 'Без комментария.'}"
            </p>
          )}
        </div>
      </div>

      {/* Row / Column controls */}
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-2.5 border-t border-slate-100 md:border-0 pt-3 md:pt-0 shrink-0">
        <div className="space-y-1 w-full md:w-36">
          <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">Сменить статус</label>
          <button
            type="button"
            onClick={() => setActiveStatusSelectLead(lead)}
            className="w-full flex items-center justify-between text-[11px] font-semibold px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs text-slate-705 transition-all cursor-pointer focus:outline-none"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span>{STATUS_DETAILS[lead.status].icon}</span>
              <span className="truncate">{STATUS_DETAILS[lead.status].label}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Вы уверены, что хотите удалить заявку №${lead.id} (${lead.name})?`)) {
              deleteLead(lead.id, lead.name);
            }
          }}
          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium rounded-lg text-xs flex items-center justify-center gap-1 transition-colors border border-rose-100/50 md:w-36 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Удалить</span>
        </button>
      </div>
    </motion.div>
  );
};

export default LeadCard;
