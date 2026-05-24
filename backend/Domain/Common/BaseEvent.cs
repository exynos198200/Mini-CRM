using System;
using MediatR;

namespace MiniCrm.Domain.Common;

/// <summary>
/// Интерфейс-маркер для всех доменных событий системы Clean Architecture.
/// </summary>
public interface IDomainEvent : INotification
{
    DateTimeOffset OccurrenceTime { get; }
}

/// <summary>
/// Базовый класс доменного события.
/// </summary>
public abstract class BaseEvent : IDomainEvent
{
    public DateTimeOffset OccurrenceTime { get; } = DateTimeOffset.UtcNow;
}
