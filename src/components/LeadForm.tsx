import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { useLeads } from '../context/LeadContext';

export default function LeadForm() {
  const { showAdd, setShowAdd, createLead, showToast } = useLeads();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  if (!showAdd) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Пожалуйста, заполните обязательные поля: Имя и Телефон!', 'warning');
      return;
    }
    
    createLead(name, phone, comment);
    
    // Reset Form
    setName('');
    setPhone('');
    setComment('');
    setShowAdd(false);
  };

  return (
    <div className="bg-slate-50 border-b border-slate-100 overflow-hidden">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-blue-500" />
            Добавить новую заявку
          </h5>
          <button 
            type="button" 
            onClick={() => setShowAdd(false)} 
            className="text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Имя Клиента *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Иван Кузнецов"
              className="w-full px-3 py-2 bg-white border border-slate-150 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Телефон *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 000-00-00"
              className="w-full px-3 py-2 bg-white border border-slate-150 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Комментарий менеджера
          </label>
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Опишите требования или детали обращения..."
            className="w-full px-3 py-2 bg-white border border-slate-150 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-300 font-sans"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowAdd(false)}
            className="px-3.5 py-1.5 border border-slate-100 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-950 text-white rounded-lg text-xs font-medium hover:bg-slate-850 cursor-pointer"
          >
            Сохранить Заявку
          </button>
        </div>
      </form>
    </div>
  );
}
