using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.DTOs;
using MiniCrm.Domain.Events;

namespace MiniCrm.Application.Leads.EventHandlers;

/// <summary>
/// Асинхронный обработчик доменного события создания лида.
/// Исключает дублирование логики и позволяет автоматически оповещать всех менеджеров о новой сделке.
/// </summary>
public class LeadCreatedEventHandler : INotificationHandler<LeadCreatedEvent>
{
    private readonly ILeadsHubService _leadsHubService;
    private readonly ILogger<LeadCreatedEventHandler> _logger;

    public LeadCreatedEventHandler(
        ILeadsHubService leadsHubService,
        ILogger<LeadCreatedEventHandler> logger)
    {
        _leadsHubService = leadsHubService ?? throw new ArgumentNullException(nameof(leadsHubService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Handle(LeadCreatedEvent notification, CancellationToken cancellationToken)
    {
        var lead = notification.Lead;
        _logger.LogInformation("Domain Event [LeadCreatedEvent]: Создана новая сделка {LeadId} ({LeadName}) на сумму {DealValue}", 
            lead.Id, lead.Name, lead.DealValue);

        var dto = LeadDto.FromEntity(lead);

        // Отправка real-time оповещения по SignalR
        await _leadsHubService.NotifyLeadCreated(dto, cancellationToken);
    }
}
