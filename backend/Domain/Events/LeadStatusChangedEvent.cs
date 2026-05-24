using MiniCrm.Domain.Common;
using MiniCrm.Domain.Entities;
using MiniCrm.Domain.Enums;

namespace MiniCrm.Domain.Events;

/// <summary>
/// Доменное событие: статус лида изменен.
/// Позволяет реализовать асинхронную реакцию в слоях CRM (логирование, кэш, отправка сокетов, скоринг).
/// </summary>
public class LeadStatusChangedEvent : BaseEvent
{
    public Lead Lead { get; }
    public LeadStatus OldStatus { get; }
    public LeadStatus NewStatus { get; }

    public LeadStatusChangedEvent(Lead lead, LeadStatus oldStatus, LeadStatus newStatus)
    {
        Lead = lead;
        OldStatus = oldStatus;
        NewStatus = newStatus;
    }
}
