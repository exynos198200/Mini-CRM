import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Send, 
  FileCode, 
  Folders, 
  Copy, 
  Check, 
  ArrowRight, 
  Cpu, 
  Zap, 
  Container, 
  Code2,
  ChevronRight,
  FolderOpen,
  FileText
} from 'lucide-react';

interface ArchBlueprintProps {
  onNotify: (message: string, type: 'success' | 'info' | 'warning') => void;
}

export default function ArchBlueprint({ onNotify }: ArchBlueprintProps) {
  const [subTab, setSubTab] = useState<'db' | 'layers' | 'endpoints' | 'realtime' | 'docker'>('db');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Код успешно скопирован в буфер обмена!', 'success');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const sqlCode = `-- Схема базы данных PostgreSQL для сущности "Lead"
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE lead_status AS ENUM (
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'LOST',
  'WON'
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    status lead_status NOT NULL DEFAULT 'NEW',
    comment TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_leads_name_trgm ON leads USING gin (name gin_trgm_ops);`;

  const folderTree = [
    {
      name: "MiniCrmCae.sln",
      type: "file",
      path: "/",
      description: "Глобальный файл .NET 8 Solution, объединяющий все проекты"
    },
    {
      name: "src/Domain (Доменный слой)",
      type: "dir",
      path: "/Domain",
      description: "Ядро системы. Не зависит ни от каких других библиотек и внешних фреймворков. Содержит сущности бизнеса.",
      children: [
        { name: "Entities/Lead.cs", type: "file", path: "/Domain/Entities/Lead.cs", description: "Сущность Lead бизнес-логики с валидацией инвариантов" },
        { name: "Enums/LeadStatus.cs", type: "file", path: "/Domain/Enums/LeadStatus.cs", description: "C# Enum, дублирующий статусы воронки продаж" },
        { name: "Exceptions/DomainException.cs", type: "file", path: "/Domain/Exceptions", description: "Кастомные исключения ядра бизнеса" },
      ]
    },
    {
      name: "src/Application (Прикладной слой)",
      type: "dir",
      path: "/Application",
      description: "Бизнес-правила (use-cases). Содержит DTO, Commands, Queries, интерфейсы портов, MediatR хэндлеры.",
      children: [
        { name: "Common/Interfaces/IApplicationDbContext.cs", type: "file", path: "/Application/Interfaces", description: "Контракт доступа к БД (Dependency Inversion)" },
        { name: "Common/Interfaces/ILeadsHubService.cs", type: "file", path: "/Application/Interfaces", description: "Интерфейс для отправки SignalR оповещений о лидах" },
        { name: "Leads/Commands/CreateLead/CreateLeadCommand.cs", type: "file", path: "/Application/Commands", description: "Квадрат команды CQRS: Создать новый Лид" },
        { name: "Leads/Commands/CreateLead/CreateLeadCommandValidator.cs", type: "file", path: "/Application/Commands", description: "FluentValidation для входящих данных лида" },
        { name: "Leads/Queries/GetLeadsList/GetLeadsQuery.cs", type: "file", path: "/Application/Queries", description: "CQRS Запрос: Получение списка с фильтрами и поиском" },
        { name: "Leads/DTOs/LeadDto.cs", type: "file", path: "/Application/DTOs", description: "Транспортный объект ответа (Data Transfer Object)" },
      ]
    },
    {
      name: "src/Infrastructure (Инфраструктурный слой)",
      type: "dir",
      path: "/Infrastructure",
      description: "Реализация интерфейсов прикладного слоя. Доступ к PostgreSQL через Entity Framework Core, отправка почты, шифрование.",
      children: [
        { name: "Persistence/ApplicationDbContext.cs", type: "file", path: "/Infrastructure/Persistence", description: "Класс контекста EF Core, связывающий сущности с БД PostgreSQL" },
        { name: "Persistence/Configurations/LeadConfiguration.cs", type: "file", path: "/Infrastructure/Configs", description: "Fluent API конфигурация сущности (маппинг полей, индексы SQL)" },
        { name: "Persistence/Migrations/", type: "dir", path: "/Infrastructure/Migrations", description: "Автоматически сгенерированные файлы миграций базы данных" },
        { name: "Services/DateTimeService.cs", type: "file", path: "/Infrastructure/Services", description: "Глобальный провайдер системного времени UTC" },
      ]
    },
    {
      name: "src/WebAPI (Презентационный слой)",
      type: "dir",
      path: "/WebAPI",
      description: "Точка входа .NET 8. Отвечает за прием HTTP-запросов, обработку CORS, SignalR хабы, Swagger документацию.",
      children: [
        { name: "Controllers/LeadsController.cs", type: "file", path: "/WebAPI/Controllers", description: "REST API Контроллер. Вызывает MediatR и возвращает DTO" },
        { name: "Hubs/LeadsHub.cs", type: "file", path: "/WebAPI/Hubs", description: "SignalR хаб, реализующий отправку уведомлений по сокетам" },
        { name: "Middlewares/ExceptionHandlingMiddleware.cs", type: "file", path: "/WebAPI/Middlewares", description: "Глобальный перехватчик ошибок для возврата валидного RFC 7807 JSON" },
        { name: "Program.cs", type: "file", path: "/WebAPI/Program.cs", description: "Инициализатор приложения .NET 8, DI контейнер, Middlewares Pipeline" },
        { name: "appsettings.json", type: "file", path: "/WebAPI/appsettings.json", description: "Файл конфигурации (строки подключения к Postgres, JWT ключи)" },
      ]
    }
  ];

  const apiEndpointsList = [
    {
      method: "GET",
      url: "/leads",
      title: "Получить список лидов",
      description: "Возвращает пагинированный список заявок с поддержкой поиска по имени/телефону и фильтрации по статусу.",
      requestBody: "Нет (Параметры URL: query=Алекс, status=NEW, page=1, pageSize=10)",
      responseBody: `{
  "items": [
    { "id": "uuid-1234", "name": "Игорь Сидоров", "phone": "+79051112233", "status": "NEW", "comment": "...", "createdAt": "2026-05-24T09:20:00Z" }
  ],
  "totalCount": 24,
  "page": 1,
  "pageSize": 10
}`,
      statusCodes: [
        { code: 200, description: "Успешное выполнение, список DTO" },
        { code: 401, description: "Не авторизован (Bearer JWT)" }
      ]
    },
    {
      method: "POST",
      url: "/leads",
      title: "Создать лид",
      description: "Заводит новую заявку в CRM. Автоматически валидирует корректность телефона и заполненность полей.",
      requestBody: `{
  "name": "Максим Петров",
  "phone": "+79998887766",
  "comment": "Оставил заявку на звонок"
}`,
      responseBody: `{
  "id": "generated-uuid-5678",
  "name": "Максим Петров",
  "phone": "+79998887766",
  "status": "NEW",
  "comment": "Оставил заявку на звонок",
  "createdAt": "2026-05-24T09:23:00Z"
}`,
      statusCodes: [
        { code: 201, description: "Заявка успешно зарегистрирована." },
        { code: 400, description: "Невалидный телефон или пустое имя" }
      ]
    },
    {
      method: "PATCH",
      url: "/leads/{id}/status",
      title: "Обновить статус лида",
      description: "Частичное обновление. Переводит лид на другой этап воронки продаж. Инициирует SignalR бродкаст уведомление.",
      requestBody: `{
  "status": "QUALIFIED"
}`,
      responseBody: `{
  "id": "uuid-1234",
  "status": "QUALIFIED",
  "updatedAt": "2026-05-24T09:24:10Z"
}`,
      statusCodes: [
        { code: 200, description: "Статус изменен, SignalR отправка завершена" },
        { code: 404, description: "Лид с указанным ID не найден" }
      ]
    },
    {
      method: "PUT",
      url: "/leads/{id}",
      title: "Полное обновление лида",
      description: "Позволяет редактировать имя, телефон и подробный развернутый комментарий лида.",
      requestBody: `{
  "name": "Макс Петров (ИП)",
  "phone": "+79998887766",
  "comment": "Обсудили ТЗ. Бюджет подтвержден в районе 300 000 руб."
}`,
      responseBody: `{
  "id": "uuid-1234",
  "name": "Макс Петров (ИП)",
  "phone": "+79998887766",
  "status": "NEW",
  "comment": "Обсудили ТЗ. Бюджет подтвержден в районе 300 000 руб.",
  "createdAt": "..."
}`,
      statusCodes: [
        { code: 200, description: "Заявка успешно обновлена" },
        { code: 400, description: "Ошибка валидации" },
        { code: 404, description: "Лид не найден" }
      ]
    },
    {
      method: "DELETE",
      url: "/leads/{id}",
      title: "Мягкое удаление лида",
      description: "Помечает колонку is_deleted как true для скрытия из выдачи. Физически строка остается в аудит-логе PostgreSQL.",
      requestBody: "Нет",
      responseBody: `Empty (No Content)`,
      statusCodes: [
        { code: 204, description: "Успешное мягкое удаление" },
        { code: 404, description: "Лид не найден" }
      ]
    }
  ];

  const signalRHubCode = `using Microsoft.AspNetCore.SignalR;
using MiniCrm.Application.DTOs;

namespace MiniCrm.WebAPI.Hubs;

public interface ILeadsClient
{
    Task ReceiveLeadCreated(LeadDto lead);
    Task ReceiveLeadStatusChanged(Guid id, string newStatus);
    Task ReceiveLeadCommentUpdated(Guid id, string comment);
    Task ReceiveLeadDeleted(Guid id);
}

public class LeadsHub : Hub<ILeadsClient>
{
    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "SalesTeam");
        await base.OnConnectedAsync();
    }
}`;

  const signalRReactCode = `import * as signalR from "@microsoft/signalr";

export function setupLeadsRealtimeConnection(onEventReceived: (type: string, payload: any) => void) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hubs/leads-pipeline", {
      accessTokenFactory: () => localStorage.getItem("token") || ""
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  connection.on("ReceiveLeadCreated", (lead) => onEventReceived("NEW_LEAD", lead));
  connection.on("ReceiveLeadStatusChanged", (id, status) => onEventReceived("STATUS_CHANGED", { id, status }));
  connection.on("ReceiveLeadCommentUpdated", (id, comment) => onEventReceived("COMMENT_ADDED", { id, comment }));
  connection.on("ReceiveLeadDeleted", (id) => onEventReceived("LEAD_DELETED", id));

  connection.start()
    .then(() => console.log("Connection established"))
    .catch(err => console.error("Connection Error: ", err));

  return connection;
}`;

  const dockerComposeYaml = `version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: minicrm_postgres_db
    restart: always
    environment:
      POSTGRES_DB: minicrm_db
      POSTGRES_USER: crm_admin
      POSTGRES_PASSWORD: SecretStrongPassword_2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U crm_admin -d minicrm_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  webapi:
    image: company/minicrm-api:latest
    container_name: minicrm_dotnet_api
    restart: always
    build:
      context: .
      dockerfile: src/WebAPI/Dockerfile
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ConnectionStrings__DefaultConnection=Host=db;Port=5432;Database=minicrm_db;Username=crm_admin;Password=SecretStrongPassword_2026
    depends_on:
      db:
        condition: service_healthy

volumes:
  postgres_data:`;

  return (
    <div id="arch-blueprint-root" className="bg-white border border-gray-150 rounded-3xl shadow-sm overflow-hidden font-sans">
      <div className="p-6 bg-slate-900 text-white border-b border-gray-805">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-mono font-bold">CA BLUEPRINT</span>
              <span className="text-xs text-slate-400 font-mono">Architectural Spec (C# / PG16 / Docker)</span>
            </div>
            <h2 className="font-bold text-2xl text-slate-100 mt-1">Инженерный подход и Спецификации</h2>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700/60 max-w-full overflow-x-auto">
            <button
              onClick={() => setSubTab('db')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                subTab === 'db' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>База данных</span>
            </button>
            <button
              onClick={() => setSubTab('layers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                subTab === 'layers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Слои CA</span>
            </button>
            <button
              onClick={() => setSubTab('endpoints')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                subTab === 'endpoints' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>Endpoints API</span>
            </button>
            <button
              onClick={() => setSubTab('realtime')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                subTab === 'realtime' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Realtime</span>
            </button>
            <button
              onClick={() => setSubTab('docker')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0 ${
                subTab === 'docker' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Container className="h-3.5 w-3.5" />
              <span>Docker</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {subTab === 'db' && (
          <div id="subtab-db" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Cpu className="text-blue-500 h-5 w-5" />
                  Решение для СУБД: PostgreSQL
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Для реализации хранения лидов выбрана СУБД <strong>PostgreSQL 16</strong>. Она превосходит аналоги за счет нативной поддержки перечислений (ENUM), надежного механизма транзаций ACID и сильных инструментов индексации текстового поиска.
                </p>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-105 text-xs space-y-3">
                  <h4 className="font-bold text-blue-800">Основные моменты архитектуры БД:</h4>
                  <ul className="space-y-2 list-disc pl-4 text-gray-700">
                    <li><strong>Контроль Статусов</strong>: Статус контролируется на уровне СУБД через <code>ENUM</code>, исключая запись невалидных строк.</li>
                    <li><strong>Управление UUID</strong>: Идентификатор — <code>UUID v4</code>.</li>
                    <li><strong>Аудит-Контроль</strong>: Добавлен <code>is_deleted</code> для реализации Soft Delete.</li>
                    <li><strong>Fuzzy Search</strong>: Триграммный GIN-индекс (модуль <code>pg_trgm</code>) обеспечивает быстрый нечеткий поиск.</li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono bg-gray-50 px-4 py-2 rounded-t-xl border-t border-x border-gray-100">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <FileCode className="h-4 w-4 text-blue-500" />
                    schema.sql & indexes
                  </span>
                  <button
                    onClick={() => handleCopyCode('db_sql', sqlCode)}
                    className="hover:text-gray-800 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
                  >
                    {copiedId === 'db_sql' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>Копировать</span>
                  </button>
                </div>
                <pre className="p-4 bg-gray-950 text-gray-200 rounded-b-xl overflow-x-auto text-xs font-mono h-[350px] border border-gray-900 scrollbar-thin">
                  {sqlCode}
                </pre>
              </div>
            </div>
          </div>
        )}

        {subTab === 'layers' && (
          <div id="subtab-layers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Layers className="text-blue-500 h-5 w-5" />
                  Принципы Clean Architecture (.NET 8)
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Главный принцип этой архитектуры — <strong>независимость ядра бизнес-логики от СУБД, веб-фреймворков и библиотек UI</strong>. Все слои завязаны на принципе Dependency Inversion (инверсия зависимостей).
                </p>

                <div className="border border-purple-100 bg-purple-50/20 rounded-xl p-4 space-y-3.5 text-xs">
                  <span className="font-bold text-purple-800">Как это работает на практике:</span>
                  <div className="space-y-1.5 text-gray-700">
                    <p className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-purple-500" /><strong>Домен</strong> содержит сущность <code>Lead</code>. Он абсолютно изолирован.</p>
                    <p className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-purple-500" /><strong>Приложение</strong> определяет интерфейсы и CQRS хэндлеры через MediatR.</p>
                    <p className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-purple-500" /><strong>Инфраструктура</strong> подключает PostgreSQL EF Core.</p>
                    <p className="flex items-center gap-1.5"><ArrowRight className="h-3 w-3 text-purple-500" /><strong>WebAPI</strong> — контроллеры и хаб SignalR.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <Folders className="h-4 w-4 text-gray-400" />
                  Навигатор структуры решения
                </span>

                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden text-xs max-h-[440px] overflow-y-auto">
                  {folderTree.map((item, idx) => (
                    <div key={idx} className="p-3 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-start gap-2.5">
                        {item.type === 'dir' ? (
                          <FolderOpen className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                        ) : (
                          <FileText className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                        )}
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-gray-800">{item.name}</span>
                          <p className="text-gray-550 leading-relaxed text-[11px]">{item.description}</p>
                          
                          {item.children && (
                            <div className="ml-4 mt-2 border-l border-gray-150 pl-3 space-y-1.5 font-mono text-[11px]">
                              {item.children.map((child, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1 text-gray-600">
                                  <ChevronRight className="h-3 w-3 text-slate-350" />
                                  <span className="font-semibold text-gray-700">{child.name}</span>
                                  <span className="text-gray-400 text-[10px]">— {child.description}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {subTab === 'endpoints' && (
          <div id="subtab-endpoints" className="space-y-4">
            <h3 className="font-semibold text-lg text-gray-950 flex items-center gap-1.5">
              <Code2 className="text-blue-500 h-5 w-5" />
              REST API Контракты Эндпоинтов (WebAPI)
            </h3>
            
            <div className="border border-gray-150 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white shadow-sm font-sans">
              {apiEndpointsList.map((ep, idx) => {
                let badge = 'bg-blue-50 text-blue-700 border-blue-100';
                if (ep.method === 'POST') badge = 'bg-teal-50 text-teal-700 border-teal-100';
                if (ep.method === 'PATCH') badge = 'bg-amber-50 text-amber-700 border-amber-100';
                if (ep.method === 'DELETE') badge = 'bg-rose-50 text-rose-700 border-rose-100';

                return (
                  <div key={idx} className="p-5 hover:bg-slate-50/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${badge} font-mono w-16 text-center`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-sm font-bold text-gray-800">
                          {ep.url}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {ep.title}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                      {ep.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Входящий Body / Query:</span>
                        <pre className="p-2.5 bg-slate-900 text-slate-300 rounded-lg mt-1 overflow-x-auto whitespace-pre h-24 text-[10px]">
                          {ep.requestBody}
                        </pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Ответ API (JSON):</span>
                        <pre className="p-2.5 bg-slate-950 text-emerald-400 rounded-lg mt-1 overflow-x-auto whitespace-pre h-24 text-[10px] scrollbar-thin">
                          {ep.responseBody}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {subTab === 'realtime' && (
          <div id="subtab-realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Zap className="text-blue-500 h-5 w-5" />
                  Realtime: SignalR против WebSockets
                </h3>
                <p className="text-xs text-gray-601 leading-relaxed">
                  Для приложений на ASP.NET Core <strong>SignalR</strong> является промышленным стандартом.
                </p>

                <div className="space-y-3.5 divide-y divide-gray-100">
                  <div className="pt-2 text-xs">
                    <span className="font-bold text-emerald-700">✔ Преимущества SignalR:</span>
                    <ul className="list-disc pl-4 text-gray-600 mt-1 space-y-1">
                      <li>Автоматический фолбек транспортов.</li>
                      <li>Встроенное управление группами и комнатами.</li>
                      <li>Устойчивое автоматическое переподключение.</li>
                    </ul>
                  </div>
                  <div className="pt-3 text-xs">
                    <span className="font-bold text-rose-700">❌ Недостатки сырых WebSockets:</span>
                    <p className="text-gray-600 mt-1 pl-4">
                      Приходится писать много бойлерплейта для удержания соединений и маршрутизации.
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-mono bg-gray-50 px-4 py-2 rounded-t-xl border-t border-x border-gray-100">
                    <span className="flex items-center gap-1.5 text-gray-650">
                      <FileCode className="h-4 w-4 text-blue-500" />
                      LeadsHub.cs (C# Backend)
                    </span>
                    <button
                      onClick={() => handleCopyCode('hub', signalRHubCode)}
                      className="hover:text-gray-805 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
                    >
                      {copiedId === 'hub' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>Копировать</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-gray-950 text-gray-200 rounded-b-xl overflow-x-auto text-[10px] font-mono h-[180px] border border-gray-900 scrollbar-thin">
                    {signalRHubCode}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-mono bg-gray-50 px-4 py-2 rounded-t-xl border-t border-x border-gray-100">
                    <span className="flex items-center gap-1.5 text-gray-650">
                      <FileCode className="h-4 w-4 text-purple-500" />
                      signalrService.ts (React Client)
                    </span>
                    <button
                      onClick={() => handleCopyCode('react_r', signalRReactCode)}
                      className="hover:text-gray-805 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
                    >
                      {copiedId === 'react_r' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>Копировать</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-gray-950 text-gray-200 rounded-b-xl overflow-x-auto text-[10px] font-mono h-[180px] border border-gray-900 scrollbar-thin">
                    {signalRReactCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {subTab === 'docker' && (
          <div id="subtab-docker" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Container className="text-blue-500 h-5 w-5" />
                  Контейнеризация проекта
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Использование контейнеров <strong>Docker</strong> гарантирует воспроизводимость среды разработки и прокдакшена.
                </p>

                <div className="bg-slate-50 border rounded-xl p-4 text-xs space-y-3">
                  <span className="font-bold text-slate-800">Ключевые моменты Docker-Compose:</span>
                  <ul className="space-y-2 list-disc pl-4 text-gray-600">
                    <li><strong>Healthcheck для Postgres</strong>: Инструкция <code>pg_isready</code>.</li>
                    <li><strong>Зависимости запуска</strong>: Блок <code>depends_on</code> с условием готовности.</li>
                    <li><strong>Сохранение данных</strong>: Использование дисков Volumes.</li>
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono bg-gray-50 px-4 py-2 rounded-t-xl border-t border-x border-gray-100">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <FileCode className="h-4 w-4 text-emerald-500" />
                    docker-compose.yml
                  </span>
                  <button
                    onClick={() => handleCopyCode('docker_yaml', dockerComposeYaml)}
                    className="hover:text-gray-800 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded shadow-sm flex items-center gap-1 hover:bg-gray-50 cursor-pointer"
                  >
                    {copiedId === 'docker_yaml' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>Копировать</span>
                  </button>
                </div>
                <pre className="p-4 bg-gray-950 text-gray-200 rounded-b-xl overflow-x-auto text-xs font-mono h-[300px] border border-gray-900 scrollbar-thin">
                  {dockerComposeYaml}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
