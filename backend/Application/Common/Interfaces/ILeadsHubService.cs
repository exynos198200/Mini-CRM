using System;
using System.Threading;
using System.Threading.Tasks;
using MiniCrm.Application.DTOs;

namespace MiniCrm.Application.Common.Interfaces;

/// <summary>
/// Интерфейс для бродкастинга изменений состояния лидов в реальном времени.
/// </summary>
public interface ILeadsHubService
{
    Task NotifyLeadCreated(LeadDto lead, CancellationToken cancellationToken = default);
    Task NotifyLeadStatusChanged(Guid leadId, string nextStatus, CancellationToken cancellationToken = default);
    Task NotifyLeadCommentUpdated(Guid leadId, string comment, CancellationToken cancellationToken = default);
    Task NotifyLeadDeleted(Guid leadId, CancellationToken cancellationToken = default);
}
