using System;
using MiniCrm.Domain.Common;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Domain.Events;

/// <summary>
/// Доменное событие: лид был мягко удален.
/// </summary>
public class LeadDeletedEvent : BaseEvent
{
    public Guid LeadId { get; }

    public LeadDeletedEvent(Guid leadId)
    {
        LeadId = leadId;
    }
}
