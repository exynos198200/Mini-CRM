import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lead, LeadStatus, RealtimeEvent } from '../types';

export const STATUS_DETAILS = {
  [LeadStatus.NEW]: {
    label: 'Новая заявка',
    icon: '✨',
    colorClass: 'text-blue-700 bg-blue-50/80 border-blue-200',
    dotClass: 'bg-blue-500',
    hoverClass: 'hover:bg-blue-50/50',
    activeBg: 'bg-blue-50 text-blue-900 border-blue-300',
    pillClass: 'bg-blue-50 text-blue-700 border-blue-200/60',
    mobileBg: 'text-blue-700',
  },
  [LeadStatus.CONTACTED]: {
    label: 'На связи',
    icon: '📞',
    colorClass: 'text-amber-700 bg-amber-50/80 border-amber-200',
    dotClass: 'bg-amber-500',
    hoverClass: 'hover:bg-amber-50/50',
    activeBg: 'bg-amber-50 text-amber-900 border-amber-300',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    mobileBg: 'text-amber-700',
  },
  [LeadStatus.QUALIFIED]: {
    label: 'Квалифицирован',
    icon: '✅',
    colorClass: 'text-purple-700 bg-purple-50/80 border-purple-200',
    dotClass: 'bg-purple-500',
    hoverClass: 'hover:bg-purple-50/50',
    activeBg: 'bg-purple-50 text-purple-900 border-purple-300',
    pillClass: 'bg-purple-50 text-purple-700 border-purple-200/60',
    mobileBg: 'text-purple-700',
  },
  [LeadStatus.LOST]: {
    label: 'Сделка проиграна',
    icon: '❌',
    colorClass: 'text-rose-700 bg-rose-50/80 border-rose-200',
    dotClass: 'bg-rose-500',
    hoverClass: 'hover:bg-rose-50/50',
    activeBg: 'bg-rose-50 text-rose-900 border-rose-300',
    pillClass: 'bg-rose-50 text-rose-700 border-rose-200/60',
    mobileBg: 'text-rose-700',
  },
  [LeadStatus.WON]: {
    label: 'Сделка выиграна',
    icon: '🏆',
    colorClass: 'text-emerald-700 bg-emerald-50/80 border-emerald-200',
    dotClass: 'bg-emerald-500',
    hoverClass: 'hover:bg-emerald-50/50',
    activeBg: 'bg-emerald-50 text-emerald-950 border-emerald-300',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    mobileBg: 'text-emerald-700',
  },
};

export const calculateDealValue = (comment: string): number => {
  if (!comment) return 15000;
  const text = comment.toLowerCase();
  let baseValue = 15000;
  if (text.includes('под ключ') || text.includes('разработка')) baseValue += 100000;
  if (text.includes('api') || text.includes('интеграция')) baseValue += 45000;
  if (text.includes('телефония') || text.includes('настройка')) baseValue += 20000;
  if (text.includes('лицензия') || text.includes('облако')) baseValue += 35000;
  if (text.includes('рефакторинг') || text.includes('легаси')) baseValue += 60000;
  if (text.includes('крупный') || text.includes('b2b') || text.includes('корпоративный')) baseValue *= 1.5;
  return baseValue;
};

const INITIAL_LEADS: Lead[] = [
  {
    id: 'L-101',
    name: 'Александр Иванов',
    phone: '+7 (911) 234-56-78',
    status: LeadStatus.NEW,
    comment: 'Интересуется внедрением CRM под ключ. Оставил заявку с формы на сайте.',
    dealValue: 115000,
    createdAt: '2026-05-24T08:15:00Z',
  },
  {
    id: 'L-102',
    name: 'Мария Смирнова',
    phone: '+7 (921) 987-65-43',
    status: LeadStatus.CONTACTED,
    comment: 'Провели первый созвон. Выслал коммерческое предложение на email.',
    dealValue: 15000,
    createdAt: '2026-05-23T14:30:00Z',
  },
  {
    id: 'L-103',
    name: 'Дмитрий Кузнецов',
    phone: '+7 (905) 555-12-34',
    status: LeadStatus.QUALIFIED,
    comment: 'Бюджет согласован. Готовы обсуждать договор на разработку API.',
    dealValue: 60000,
    createdAt: '2026-05-22T10:00:00Z',
  },
  {
    id: 'L-104',
    name: 'Екатерина Попова',
    phone: '+7 (999) 111-22-33',
    status: LeadStatus.WON,
    comment: 'Договор подписан, первая предоплата поступила на рассчетный счет b2b.',
    dealValue: 22500,
    createdAt: '2026-05-21T16:45:00Z',
  },
  {
    id: 'L-105',
    name: 'Артем Соколов',
    phone: '+7 (916) 444-55-66',
    status: LeadStatus.LOST,
    comment: 'Дорого. Выбрали бесплатное облачное решение Битрикс24.',
    dealValue: 15000,
    createdAt: '2026-05-20T11:20:00Z',
  },
];

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

export interface CrmUser {
  name: string;
  role: 'Administrator' | 'Manager' | 'Guest';
  token: string;
}

interface LeadContextType {
  leads: Lead[];
  query: string;
  setQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (sf: string) => void;
  isLive: boolean;
  setIsLive: (b: boolean) => void;
  onlineManagers: number;
  logs: RealtimeEvent[];
  leadsFiltered: Lead[];
  showAdd: boolean;
  setShowAdd: (b: boolean) => void;
  activeStatusSelectLead: Lead | null;
  setActiveStatusSelectLead: (lead: Lead | null) => void;
  
  // Auth state
  currentUser: CrmUser;
  setCurrentUser: (u: CrmUser) => void;
  
  // KPI Metrics
  totalLeadsCount: number;
  newLeadsCount: number;
  contactedLeadsCount: number;
  qualifiedLeadsCount: number;
  wonLeadsCount: number;
  lostLeadsCount: number;
  winRatePercentage: number;
  
  // Actions
  addLog: (type: RealtimeEvent['type'], message: string, targetId: string) => void;
  createLead: (name: string, phone: string, comment: string) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  deleteLead: (id: string, name: string) => void;
  saveLeadComment: (id: string, comment: string) => void;
  simulateRealtimeEvent: () => void;
  resetDatabase: () => void;
  
  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CrmUser>({
    name: 'Инна Новикова',
    role: 'Administrator',
    token: 'Mock-JWT-Header-Payload-AdminRole-2026'
  });
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLive, setIsLive] = useState(true);
  const [onlineManagers, setOnlineManagers] = useState(3);
  const [showAdd, setShowAdd] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeStatusSelectLead, setActiveStatusSelectLead] = useState<Lead | null>(null);
  
  const [logs, setLogs] = useState<RealtimeEvent[]>([
    {
      id: 'log-0',
      type: 'COMMENT_ADDED',
      message: 'SignalR: Подключено к линкам Hub /hubs/leads (Транспорт: WebSockets)',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      targetId: 'system',
    }
  ]);

  // Toast Handler
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismissing after 4.5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addLog = (type: RealtimeEvent['type'], message: string, targetId: string) => {
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        type,
        message,
        timestamp: new Date().toISOString(),
        targetId,
      },
      ...prev,
    ].slice(0, 35));
  };

  const createLead = (name: string, phone: string, comment: string) => {
    const normalizedPhone = phone.trim().replace(/[^0-9+]/g, '');
    const isDuplicate = leads.some(l => l.phone.trim().replace(/[^0-9+]/g, '') === normalizedPhone);
    
    if (isDuplicate) {
      const errMsg = `Ошибка валидации: Заявка с телефоном '${phone.trim()}' уже зарегистрирована и обрабатывается в CRM БД.`;
      addLog('COMMENT_ADDED', `C# Blocked: Попытка создания дубликата телефонного номера ${phone.trim()}`, 'system');
      showToast(errMsg, 'warning');
      return;
    }

    const trimmedComment = comment.trim() || 'Без комментария.';
    const freshId = `L-${100 + leads.length + Math.floor(Math.random() * 20) + 1}`;
    const freshLead: Lead = {
      id: freshId,
      name: name.trim(),
      phone: phone.trim(),
      status: LeadStatus.NEW,
      comment: trimmedComment,
      dealValue: calculateDealValue(trimmedComment),
      createdAt: new Date().toISOString(),
    };
    
    setLeads(prev => [freshLead, ...prev]);
    const msg = `Добавлена новая заявка №${freshId} для ${freshLead.name}`;
    addLog('NEW_LEAD', msg, freshId);
    showToast(msg, 'success');
  };

  const updateLeadStatus = (id: string, s: LeadStatus) => {
    const target = leads.find(l => l.id === id);
    if (!target) return;

    // Сверяем с бизнес-правилами .NET Клин Архитектуры:
    
    // БП №1: Нельзя вернуть закрытую сделку (Won/Lost) обратно в начальные статусы
    if ((target.status === LeadStatus.WON || target.status === LeadStatus.LOST) && 
        (s === LeadStatus.NEW || s === LeadStatus.CONTACTED)) {
      const errMsg = "Бизнес-правило C#: Нельзя возвращать закрытую сделку (Выиграна/Проиграна) обратно в начальный статус во избежание фальсификации отчетов.";
      addLog('COMMENT_ADDED', `C# Validation Block: Попытка реанимации закрытого лида ${id}`, id);
      showToast(errMsg, 'warning');
      return;
    }

    // БП №2: Нельзя перевести сделку в статус "Проиграна" (Lost) без указания содержательной причины отказа
    if (s === LeadStatus.LOST && (!target.comment || target.comment.trim().length < 15)) {
      const errMsg = "Бизнес-правило C#: Перевод сделки в статус 'Сделка проиграна' требует содержательного комментария менеджера с указанием причины отказа (не менее 15 символов).";
      addLog('COMMENT_ADDED', `C# Validation Block: Смена статуса на LOST заблокирована для лида ${id} (короткая причина)`, id);
      showToast(errMsg, 'warning');
      return;
    }

    // БП №3: Выигранная сделка (Won) не должна переводиться в статус "Проиграна" напрямую
    if (target.status === LeadStatus.WON && s === LeadStatus.LOST) {
      const errMsg = "Бизнес-правило C#: Выигранная сделка была успешно завершена. Прямая смена статуса на 'Проиграна' заблокирована.";
      addLog('COMMENT_ADDED', `C# Validation Block: Заблокирована смена WON -> LOST для лида ${id}`, id);
      showToast(errMsg, 'warning');
      return;
    }

    // БП №4: Нельзя завершить сделку как Выигранную (Won) с базовой суммой (15 000 руб. и менее)
    if (s === LeadStatus.WON && target.dealValue <= 15000) {
      const errMsg = "Бизнес-правило C#: Невозможно перевести лид в статус 'Выиграна' (Won) без ценности сделки. Минимальная сумма для успешной сделки должна быть более 15 000 ₽. Укажите в комментарии детали заказа (например, 'разработка под ключ', 'интеграция API'), чтобы калькулятор пересчитал ценность.";
      addLog('COMMENT_ADDED', `C# Validation Block: Заблокировано продвижение в статус WON для лида ${id} (базовая сумма)`, id);
      showToast(errMsg, 'warning');
      return;
    }

    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: s } : l));
    const msg = `Статус заявки №${id} (${target.name}) изменен на: ${STATUS_DETAILS[s].label}`;
    addLog('STATUS_CHANGED', msg, id);
    showToast(msg, 'info');
  };

  const deleteLead = (id: string, name: string) => {
    if (currentUser.role !== 'Administrator') {
      const authRejectMsg = `Ошибка удаления: роль "${currentUser.role}" не имеет достаточных прав. Только Администратор может удалить лид №${id} согласно правилу безопасности .NET Endpoint безопасности.`;
      addLog('COMMENT_ADDED', `C# Security: Блокировка DELETE запроса на лид ${id} от пользователя ${currentUser.name} (${currentUser.role})`, id);
      showToast(authRejectMsg, 'warning');
      return;
    }

    setLeads(prev => prev.filter(l => l.id !== id));
    const msg = `Заявка №${id} (${name}) полностью удалена`;
    addLog('LEAD_DELETED', msg, id);
    showToast(msg, 'warning');
  };

  const saveLeadComment = (id: string, text: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, comment: text, dealValue: calculateDealValue(text) } : l));
    const msg = `Обновлен комментарий и пересчитана сумма у заявки №${id}`;
    addLog('COMMENT_ADDED', msg, id);
    showToast(msg, 'success');
  };

  const resetDatabase = () => {
    setLeads(INITIAL_LEADS);
    showToast('База данных CRM сброшена к исходному состоянию DB_RESTORE', 'info');
    setLogs(prev => [
      {
        id: `log-${Date.now()}`,
        type: 'COMMENT_ADDED',
        message: 'Инфраструктура: Сброс бд к начальному мигрированному состоянию (PostgreSQL pg_restore)',
        timestamp: new Date().toISOString(),
        targetId: 'system',
      },
      ...prev,
    ].slice(0, 30));
  };

  // Real-time loop simulator
  const simulateRealtimeEvent = () => {
    const managers = ['Дмитрий (Sales)', 'Анна (B2B)', 'Игорь (Tech Support)', 'Bot_Incoming'];
    const manager = managers[Math.floor(Math.random() * managers.length)];
    const actions = ['status_changed', 'comment_added', 'new_lead'];
    const act = actions[Math.floor(Math.random() * actions.length)];

    if (act === 'status_changed' && leads.length > 0) {
      const target = leads[Math.floor(Math.random() * leads.length)];
      const statuses = Object.values(LeadStatus).filter(s => s !== target.status);
      const nextStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setLeads(prev => prev.map(l => l.id === target.id ? { ...l, status: nextStatus } : l));
      const msg = `Пользователь ${manager} перевел статус №${target.id} (${target.name}) на "${STATUS_DETAILS[nextStatus].label}"`;
      addLog('STATUS_CHANGED', msg, target.id);
      showToast(msg, 'info');
    } else if (act === 'comment_added' && leads.length > 0) {
      const target = leads[Math.floor(Math.random() * 20) % leads.length];
      const phrases = [
        'Клиент готов оплатить счет на разработку под ключ.',
        'Номер телефона временно недоступен. Написал в TG по интеграции API.',
        'Просит выслать доп. соглашение на почту b2b.',
        'Обсудили требования к архитектуре API .NET Core.'
      ];
      const comment = phrases[Math.floor(Math.random() * phrases.length)];
      setLeads(prev => prev.map(l => l.id === target.id ? { ...l, comment, dealValue: calculateDealValue(comment) } : l));
      const msg = `Новый комментарий от ${manager} к №${target.id}: "${comment}"`;
      addLog('COMMENT_ADDED', msg, target.id);
      showToast(msg, 'success');
    } else {
      const firstNames = ['Сергей', 'Павел', 'Инна', 'Ярослав', 'Ольга', 'Кирилл'];
      const lastNames = ['Фролов', 'Морозов', 'Новикова', 'Чернов', 'Лысенко', 'Архипов'];
      const comments = [
        'Интересует рефакторинг легаси-проекта разработки.',
        'Заявка на подключение телефонии и настройку.',
        'Консультация по настройке docker-compose под ключ b2b.',
        'Покупка готовой лицензии CRM.'
      ];
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const phone = `+7 (9${Math.floor(100 + Math.random() * 900)}) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}-${Math.floor(10 + Math.random() * 90)}`;
      const id = `L-${100 + leads.length + 1}`;
      const randComment = comments[Math.floor(Math.random() * comments.length)];
      const fresh: Lead = {
        id,
        name,
        phone,
        status: LeadStatus.NEW,
        comment: randComment,
        dealValue: calculateDealValue(randComment),
        createdAt: new Date().toISOString()
      };
      setLeads(prev => [fresh, ...prev]);
      const msg = `Поступила новая заявка Webhook! №${id} от ${name}`;
      addLog('NEW_LEAD', msg, id);
      showToast(msg, 'success');
    }
  };

  useEffect(() => {
    if (!isLive) {
      setOnlineManagers(0);
      return;
    }
    
    // Начальное количество при подключении
    setOnlineManagers(3);

    const interval = setInterval(() => {
      if (Math.random() > 0.65) {
        simulateRealtimeEvent();
        // Рандомизируем число менеджеров онлайн [2..5]
        setOnlineManagers(Math.floor(Math.random() * 4) + 2);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isLive, leads]);

  // Filtering Logic
  const leadsFiltered = leads.filter(l => {
    const term = query.toLowerCase();
    const match = 
      l.name.toLowerCase().includes(term) || 
      l.phone.includes(query) || 
      l.id.toLowerCase().includes(term);
    return statusFilter === 'ALL' ? match : match && l.status === statusFilter;
  });

  // KPI calculations
  const totalLeadsCount = leads.length;
  const newLeadsCount = leads.filter(l => l.status === LeadStatus.NEW).length;
  const contactedLeadsCount = leads.filter(l => l.status === LeadStatus.CONTACTED).length;
  const qualifiedLeadsCount = leads.filter(l => l.status === LeadStatus.QUALIFIED).length;
  const wonLeadsCount = leads.filter(l => l.status === LeadStatus.WON).length;
  const lostLeadsCount = leads.filter(l => l.status === LeadStatus.LOST).length;
  const winRatePercentage = totalLeadsCount > 0 
    ? Math.round((wonLeadsCount / (totalLeadsCount - lostLeadsCount || 1)) * 100) 
    : 0;

  return (
    <LeadContext.Provider value={{
      leads,
      query,
      setQuery,
      statusFilter,
      setStatusFilter,
      isLive,
      setIsLive,
      onlineManagers,
      logs,
      leadsFiltered,
      showAdd,
      setShowAdd,
      activeStatusSelectLead,
      setActiveStatusSelectLead,
      
      currentUser,
      setCurrentUser,
      
      totalLeadsCount,
      newLeadsCount,
      contactedLeadsCount,
      qualifiedLeadsCount,
      wonLeadsCount,
      lostLeadsCount,
      winRatePercentage,
      
      addLog,
      createLead,
      updateLeadStatus,
      deleteLead,
      saveLeadComment,
      simulateRealtimeEvent,
      resetDatabase,
      
      toasts,
      showToast,
      dismissToast
    }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used inside a LeadProvider');
  }
  return context;
}
