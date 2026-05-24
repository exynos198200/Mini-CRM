using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Domain.Events;

namespace MiniCrm.Application.Leads.EventHandlers;

/// <summary>
/// Асинхронный обработчик доменного события мягкого удаления лида.
/// </summary>
public class LeadDeletedEventHandler : INotificationHandler<LeadDeletedEvent>
{
    private readonly ILeadsHubService _leadsHubService;
    private readonly ILogger<LeadDeletedEventHandler> _logger;

    public LeadDeletedEventHandler(
        ILeadsHubService leadsHubService,
        ILogger<LeadDeletedEventHandler> logger)
    {
        _leadsHubService = leadsHubService ?? throw new ArgumentNullException(nameof(leadsHubService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Handle(LeadDeletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Domain Event [LeadDeletedEvent]: Лид {LeadId} был успешно мягко удален.", notification.LeadId);

        // Отправка real-time обновления в SignalR вебсокет-клиенты
        await _leadsHubService.NotifyLeadDeleted(notification.LeadId, cancellationToken);
    }
}
