using System;
using System.Collections.Generic;
using MiniCrm.Domain.Common;
using MiniCrm.Domain.Enums;
using MiniCrm.Domain.Events;

namespace MiniCrm.Domain.Entities;

/// <summary>
/// Доменная сущность "Заявка" (Lead).
/// Содержит бизнес-логику и инварианты управления лидом.
/// </summary>
public class Lead
{
    private readonly List<BaseEvent> _domainEvents = new();

    // C# 9+ init-only свойства для неизменяемого идентификатора
    public Guid Id { get; init; } = Guid.NewGuid();
    
    public string Name { get; private set; } = null!;
    public string Phone { get; private set; } = null!;
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public string? Comment { get; private set; }
    public decimal DealValue { get; private set; }
    public bool IsDeleted { get; private set; } = false;
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; private set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Зарегистрированные доменные события, произошедшие в рамках жизненного цикла сущности.
    /// </summary>
    public IReadOnlyCollection<BaseEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(BaseEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();

    // Конструктор по умолчанию для ORM (Entity Framework Core)
    protected Lead() { }

    /// <summary>
    /// Конструктор создания нового валидного Лида.
    /// </summary>
    public Lead(string name, string phone, string? comment)
    {
        UpdateDetails(name, phone, comment);
        Status = LeadStatus.New;
        CreatedAt = DateTimeOffset.UtcNow;

        // Генерация доменного события
        AddDomainEvent(new LeadCreatedEvent(this));
    }

    /// <summary>
    /// Метод обновления деталей лида. Инкапсулирует бизнес-правила валидации полей и пересчета суммы.
    /// </summary>
    public void UpdateDetails(string name, string phone, string? comment)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Имя клиента не может быть пустым.", nameof(name));
            
        if (string.IsNullOrWhiteSpace(phone))
            throw new ArgumentException("Номер телефона обязателен для связи.", nameof(phone));

        Name = name.Trim();
        Phone = phone.Trim();
        Comment = comment?.Trim();
        
        RecalculateDealValue();
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Вычисляет потенциальную сумму сделки на основе ключевых слов в комментариях и требованиях.
    /// </summary>
    private void RecalculateDealValue()
    {
        if (string.IsNullOrWhiteSpace(Comment))
        {
            DealValue = 15000m; // Базовая стоимость обращения
            return;
        }

        var text = Comment.ToLowerInvariant();
        decimal calculatedAmount = 15000m;

        if (text.Contains("под ключ") || text.Contains("разработка"))
        {
            calculatedAmount += 100000m;
        }
        if (text.Contains("api") || text.Contains("интеграция"))
        {
            calculatedAmount += 45000m;
        }
        if (text.Contains("телефония") || text.Contains("настройка"))
        {
            calculatedAmount += 20000m;
        }
        if (text.Contains("лицензия") || text.Contains("облако"))
        {
            calculatedAmount += 35000m;
        }
        if (text.Contains("рефакторинг") || text.Contains("легаси"))
        {
            calculatedAmount += 60000m;
        }
        
        // Увеличение за крупные заказы (b2b)
        if (text.Contains("крупный") || text.Contains("b2b") || text.Contains("корпоративный"))
        {
            calculatedAmount *= 1.5m;
        }

        DealValue = calculatedAmount;
    }

    /// <summary>
    /// Метод перевода лида на новый этап воронки продаж с проверкой инвариантов бизнес-процесса.
    /// </summary>
    public void ChangeStatus(LeadStatus newStatus)
    {
        // Бизнес-правило №1: Нельзя вернуть закрытую сделку (Won/Lost) обратно в начальные статусы
        if ((Status == LeadStatus.Won || Status == LeadStatus.Lost) && 
            (newStatus == LeadStatus.New || newStatus == LeadStatus.Contacted))
        {
            throw new InvalidOperationException("Бизнес-правило: Нельзя возвращать закрытую сделку (Выиграна/Проиграна) обратно в начальный статус во избежание фальсификации отчетов.");
        }

        // Бизнес-правило №2: Нельзя перевести сделку в статус "Проиграна" (Lost) без указания содержательной причины отказа
        if (newStatus == LeadStatus.Lost && (string.IsNullOrWhiteSpace(Comment) || Comment.Length < 15))
        {
            throw new InvalidOperationException("Бизнес-правило: Перевод сделки в статус 'Сделка проиграна' требует содержательного комментария менеджера с указанием причины отказа (не менее 15 символов).");
        }

        // Бизнес-правило №3: Выигранная сделка (Won) не должна переводиться в статус "Проиграна" напрямую
        if (Status == LeadStatus.Won && newStatus == LeadStatus.Lost)
        {
            throw new InvalidOperationException("Бизнес-правило: Выигранная сделка была успешно завершена. Прямая смена статуса на 'Проиграна' заблокирована.");
        }

        // Бизнес-правило №4: Нельзя завершить сделку как Выигранную (Won) с базовой суммой (15 000 руб. и менее)
        if (newStatus == LeadStatus.Won && DealValue <= 15000m)
        {
            throw new InvalidOperationException("Бизнес-правило: Невозможно перевести лид в статус 'Выиграна' (Won) без ценности сделки. Минимальная сумма для успешной сделки должна быть более 15 000 ₽. Пожалуйста, укажите в комментарии детали заказа (например, 'разработка под ключ', 'интеграция API'), чтобы автоматический калькулятор пересчитал ценность.");
        }

        var oldStatus = Status;
        Status = newStatus;
        UpdatedAt = DateTimeOffset.UtcNow;

        // Генерация доменного события
        AddDomainEvent(new LeadStatusChangedEvent(this, oldStatus, newStatus));
    }

    /// <summary>
    /// Метод мягкого удаления (Soft Delete) лида из активных списков.
    /// </summary>
    public void SoftDelete()
    {
        if (!IsDeleted)
        {
            IsDeleted = true;
            UpdatedAt = DateTimeOffset.UtcNow;
            AddDomainEvent(new LeadDeletedEvent(Id));
        }
    }
}
