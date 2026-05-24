using System;

namespace MiniCrm.Domain.Enums;

/// <summary>
/// Статусы жизненного цикла лида в воронке продаж.
/// </summary>
public enum LeadStatus
{
    New,
    Contacted,
    Qualified,
    Lost,
    Won
}
