import React from 'react';
import { 
  ShieldCheck, 
  Database, 
  Cpu, 
  Sparkles, 
  CheckCircle,
  Terminal,
  Activity,
  Award
} from 'lucide-react';

export default function EngineeringAdvice() {
  const corePrinciples = [
    {
      title: "1. Паттерн CQRS и библиотека MediatR",
      icon: <Cpu className="h-5 w-5 text-purple-500" />,
      tag: "Масштабируемость",
      desc: "Разделяйте операции записи (Commands) и выборки (Queries). Благодаря CQRS со временем вы сможете беспрепятственно перевести тяжело нагруженные Query-методы на чтение из реплик PostgreSQL, либо использовать легкий Dapper во избежание оверхеда EF Core, сохранив при этом единый интерфейс вызовов.",
      items: [
        "Каждая команда/запрос — это отдельный C# файл (Single Responsibility Principle).",
        "MediatR Pipeline Behaviors автоматизирует сквозное логирование запросов и валидацию данных."
      ]
    },
    {
      title: "2. FluentValidation вместо DataAnnotations",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      tag: "Безопасность и чистота",
      desc: "Использование атрибутов [Required, Phone] над DTO сильно засоряет код. Вместо этого выносите валидационные правила в выделенные C# классы-валидаторы, наследуемые от AbstractValidator<T>. Это позволит описывать сложные условные бизнес-проверки человеческим языком.",
      items: [
        "Поддержка условного ветвления правил: .When(x => x.Status == LeadStatus.WON).",
        "Создание многоразовых кастомных правил валидации (например, регулярное выражение телефона РФ)."
      ]
    },
    {
      title: "3. Производительность EF Core и PostgreSQL",
      icon: <Database className="h-5 w-5 text-amber-500" />,
      tag: "Производительность",
      desc: "Ошибки работы с ORM — главная причина падения нагруженных CRM. Внедрите жесткие правила написания запросов с первого дня разработки MVP.",
      items: [
        "Всегда дописывайте .AsNoTracking() на GET-запросах, где полученные данные не планируется обновлять.",
        "Принимайте во всех хэндлерах CancellationToken и передавайте его в async-методы баз данных.",
        "Используйте Split Queries (.AsSplitQuery()) во избежание декартова взрыва при джойнах коллекций."
      ]
    },
    {
      title: "4. Стандартизация ошибок: RFC 7807 (Problem Details)",
      icon: <Terminal className="h-5 w-5 text-rose-500" />,
      tag: "Промышленный API",
      desc: "Единый формат ответа об ошибке экономит сотни часов frontend-команде. Не бросайте клиенту html-стектрейсы сервера при падениях БД.",
      items: [
        "Внедрите кастомный ExceptionHandlingMiddleware, перехватывающий любые падения.",
        "Возвращайте structured ProblemDetails JSON (тип, статус-код, детальный массив ошибок валидации по полям)."
      ]
    },
    {
      title: "5. Прогрессивное кэширование на фронтенде: React Query (TanStack Query)",
      icon: <Sparkles className="h-5 w-5 text-blue-500" />,
      tag: "Frontend UX",
      desc: "React Query берет на себя управление стейтом сетевых запросов. Он обеспечивает кэширование, повтор запросов при сбоях, мягкое фоновое обновление и синхронизацию состояния.",
      items: [
        "Настройте staleTime (например, 30 секунд), чтобы не бомбардировать бэкенд лишними HTTP-запросами.",
        "Интегрируйте SignalR коллбеки прямо с QueryClient, вызывая выборочную инвалидацию кэша: queryClient.invalidateQueries(['leads'])."
      ]
    },
    {
      title: "6. Чистые миграции PostgreSQL и Fluent API",
      icon: <Activity className="h-5 w-5 text-teal-500" />,
      tag: "Сопровождение БД",
      desc: "Никаких авто-генераций баз данных context.Database.EnsureCreated() в проде! Только эволюционное изменение схемы миграциями Ef Core Migrations. Спецификацию маппингов (индексы SQL, связи, дефолтные формулы) пишите строго через классы IEntityTypeConfiguration<T>.",
      items: [
        "Контролируйте нейминг внешних ключей и уникальных ограничений БД.",
        "Запускайте миграции в CI/CD пайплайне или на старте контейнера."
      ]
    }
  ];

  return (
    <div id="engineering-advice-root" className="space-y-6 font-sans">
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-gray-800">
        <div className="flex items-center gap-2.5">
          <Award className="h-6 w-6 text-yellow-400" />
          <h2 className="font-medium text-xl text-slate-100 uppercase tracking-wide">
            Инженерная мудрость от Senior Software Architect
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-4xl">
          Спроектировать MVP мини-CRM — это не просто набросать пару полей в Entity Framework. Это способность заложить фундамент архитектуры, которая сможет выдержать резкий рост команды продаж, усложнение воронки и требование к реалтайму, без необходимости тотального рефакторинга. Прислушайтесь к рекомендациям ниже.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {corePrinciples.map((card, idx) => (
          <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-gray-50 rounded-xl border border-gray-100">
                  {card.icon}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                  {card.tag}
                </span>
              </div>

              <h3 className="font-bold text-sm text-gray-900">
                {card.title}
              </h3>

              <p className="text-xs text-gray-600 leading-relaxed">
                {card.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Совет инженера:</span>
              <ul className="text-xs text-gray-700 space-y-1.5 font-sans">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 font-medium">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex items-start gap-3.5">
        <div className="p-2 bg-amber-100/50 text-amber-800 rounded-xl">
          <Activity className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 text-xs">
          <span className="font-bold text-amber-955 font-display">Рекомендация по старту разработки (MVP-to-Product):</span>
          <p className="text-amber-900/80 leading-relaxed font-medium">
            Начните кодить с <strong>Domain слоя</strong>, описывая сущность <code>Lead</code> и её инварианты. Не трогайте БД на первом шаге. Напишите Unit-тесты для команд создания и смены статуса. Наличие тестов на чистом Домене подтвердит, что ваша архитектура абсолютно развязана от внешних деталей, и позволит вашей CRM безболезненно расти до уровня корпоративного портала Enterprise класса в будущем.
          </p>
        </div>
      </div>
    </div>
  );
}
