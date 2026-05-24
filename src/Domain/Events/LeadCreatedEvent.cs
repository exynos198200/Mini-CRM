using MiniCrm.Domain.Common;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Domain.Events;

/// <summary>
/// Доменное событие: новый лид успешно создан в воронке.
/// </summary>
public class LeadCreatedEvent : BaseEvent
{
    public Lead Lead { get; }

    public LeadCreatedEvent(Lead lead)
    {
        Lead = lead;
    }
}
