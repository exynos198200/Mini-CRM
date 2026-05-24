using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Domain.Events;

namespace MiniCrm.Application.Leads.EventHandlers;

/// <summary>
/// Асинхронный обработчик доменного события смены статуса лида.
/// Исключает прямую связь между командами обновления и SignalR-оповещением.
/// </summary>
public class LeadStatusChangedEventHandler : INotificationHandler<LeadStatusChangedEvent>
{
    private readonly ILeadsHubService _leadsHubService;
    private readonly ILogger<LeadStatusChangedEventHandler> _logger;

    public LeadStatusChangedEventHandler(
        ILeadsHubService leadsHubService,
        ILogger<LeadStatusChangedEventHandler> logger)
    {
        _leadsHubService = leadsHubService ?? throw new ArgumentNullException(nameof(leadsHubService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Handle(LeadStatusChangedEvent notification, CancellationToken cancellationToken)
    {
        var lead = notification.Lead;
        _logger.LogInformation("Domain Event [LeadStatusChangedEvent]: Лид {LeadId} переведен из {OldStatus} в {NewStatus}", 
            lead.Id, notification.OldStatus, notification.NewStatus);

        // Отправка real-time обновления в SignalR вебсокет-клиенты
        await _leadsHubService.NotifyLeadStatusChanged(lead.Id, lead.Status.ToString(), cancellationToken);
    }
}
