import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Layers,
  ChevronRight,
  Workflow,
  BookmarkCheck,
  Award,
  LayoutDashboard,
  ShieldAlert,
  Users2
} from 'lucide-react';
import LeadManager from './components/LeadManager';
import ArchBlueprint from './components/ArchBlueprint';
import EngineeringAdvice from './components/EngineeringAdvice';
import { LeadProvider, useLeads, CrmUser } from './context/LeadContext';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

function AppContent() {
  const [tab, setTab] = useState<'crm' | 'architecture' | 'advice'>('crm');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { currentUser, setCurrentUser, addLog } = useLeads();

  const notify = (text: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />,
          border: 'border-emerald-500/15 bg-emerald-50/60 text-emerald-950'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
          border: 'border-rose-500/15 bg-rose-50/60 text-rose-950'
        };
      default:
        return {
          icon: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
          border: 'border-blue-500/15 bg-blue-50/60 text-blue-950'
        };
    }
  };

  const USERS_LIST: CrmUser[] = [
    {
      name: 'Инна Новикова',
      role: 'Administrator',
      token: 'Mock-JWT-Header-Payload-AdminRole-2026'
    },
    {
      name: 'Евгений Романов',
      role: 'Manager',
      token: 'Mock-JWT-Header-Payload-ManagerRole-2026'
    },
    {
      name: 'Гость системы',
      role: 'Guest',
      token: 'Mock-JWT-Header-Payload-GuestRole-2026'
    }
  ];

  const handleUserChange = (u: CrmUser) => {
    setCurrentUser(u);
    notify(`Вы вошли как ${u.name} (${u.role})`, 'success');
    addLog('COMMENT_ADDED', `Сессия: Пользователь изменен на ${u.name} | JWT Роль: ${u.role}`, 'system');
  };

  return (
    <div className="min-h-screen bg-slate-50/40 text-gray-800 font-sans selection:bg-slate-200">
      <header className="bg-white border-b border-gray-150 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gray-950 text-white rounded-xl flex items-center justify-center">
                <Workflow className="h-5 w-5 text-emerald-400 rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base sm:text-lg text-gray-950 tracking-tight">
                    Architectural CRM Blueprint
                  </h1>
                  <span className="text-[10px] font-mono bg-emerald-50 border border-emerald-250 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                    MVP PRO
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Проектирование чистой архитектуры .NET 8 + React + PostgreSQL
                </p>
              </div>
            </div>

            {/* Simulated JWT Auth Selector in Header */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-gray-200 bg-gray-50/80 rounded-xl px-3 py-1.5">
                <Users2 className="h-4 w-4 text-gray-500" />
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-mono text-gray-400 leading-none">Ролевая сессия (.NET Auth)</p>
                  <p className="text-[11px] font-semibold text-gray-950 leading-tight">{currentUser.name}</p>
                </div>
                <select
                  value={currentUser.name}
                  onChange={(e) => {
                    const sel = USERS_LIST.find(x => x.name === e.target.value);
                    if (sel) handleUserChange(sel);
                  }}
                  className="bg-transparent border-0 text-xs font-semibold focus:ring-0 cursor-pointer text-gray-700 outline-none pb-0.5"
                >
                  {USERS_LIST.map((u) => (
                    <option key={u.name} value={u.name}>
                      {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500 font-mono">
                <span className="bg-gray-100 rounded-lg px-2.5 py-1.5 border border-gray-200/50 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-yellow-500" />
                  <span>Senior Architect C#</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Security Context banner */}
      <div className="bg-gray-950 text-emerald-400 py-1.5 px-4 text-center text-xs font-mono border-b border-emerald-500/20">
        <span className="text-gray-400">Security Context:</span> Bearer Token active (
        <span className="text-amber-400 text-[11px]">{currentUser.token.substring(0, 25)}...</span>)
        {currentUser.role !== 'Administrator' && (
          <span className="ml-2.5 text-red-400 inline-flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" />
            Удаление недоступно: права роли Manager ограничены в .NET
          </span>
        )}
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-4 h-12 text-sm">
            <button
              onClick={() => {
                setTab('crm');
                notify('Открыта интерактивная панель CRM MVP', 'info');
              }}
              className={`h-full px-3.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                tab === 'crm'
                  ? 'border-gray-900 text-gray-950'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Интерактивный CRM клиент</span>
            </button>

            <button
              onClick={() => {
                setTab('architecture');
                notify('Открыты исходные файлы C# и чертежи слоев', 'info');
              }}
              className={`h-full px-3.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                tab === 'architecture'
                  ? 'border-gray-900 text-gray-950'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>Архитектурный проект & схемы</span>
            </button>

            <button
              onClick={() => {
                setTab('advice');
                notify('Открыт свод фидов и практик проектирования', 'info');
              }}
              className={`h-full px-3.5 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                tab === 'advice'
                  ? 'border-gray-900 text-gray-950'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <BookmarkCheck className="h-4 w-4" />
              <span>Советы Архитектора</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'crm' && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-150 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm text-gray-900">
                      Тестовый полигон MVP (Фронтенд + Имитация SignalR)
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                      Ниже представлена работающая в реальном времени клиентская часть на React + TypeScript. Попробуйте создать лид, изменить статус воронки продаж, или воспользуйтесь терминалом <strong>SignalR Hub</strong> справа для симуляции фоновой активности других менеджеров.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setTab('architecture');
                      notify('Переход к разделу базы данных и архитектуры', 'info');
                    }}
                    className="flex-shrink-0 px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>Смотреть БД и .NET код</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                </div>

                <LeadManager onNotify={notify} />
              </div>
            )}

            {tab === 'architecture' && <ArchBlueprint onNotify={notify} />}
            {tab === 'advice' && <EngineeringAdvice />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-gray-150 mt-16 py-8 text-xs text-gray-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <p className="font-semibold text-gray-800">
                Мини-CRM Системный Проект — MVP на .NET 8 / React 19 / PostgreSQL
              </p>
              <p className="text-gray-400 max-w-lg leading-normal">
                Комплексные инженерные спецификации подготовлены в строгом соответствии с требованиями чистого кодинга, разделения ответственности (SoC) и паттернов SOLID.
              </p>
            </div>

            <div className="text-[11px] font-mono space-y-1.5 text-gray-400 sm:text-right">
              <p>Разработчик: Senior Full Stack Architect</p>
              <p>База: PostgreSQL 16.2 | SignalR WebSocket Hub enabled</p>
              <p>Локальное время: 2026-05-24 09:23:43 UTC</p>
            </div>
          </div>
        </div>
      </footer>

      <div id="toast-container" className="fixed bottom-5 right-5 space-y-2.5 z-50 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = getToastStyle(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                className={`p-3.5 border rounded-xl shadow-lg flex items-start gap-2 w-full backdrop-blur-md pointer-events-auto ${style.border}`}
              >
                {style.icon}
                <div className="text-xs font-medium leading-tight">
                  {toast.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LeadProvider>
      <AppContent />
    </LeadProvider>
  );
}
