using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.DTOs;
using MiniCrm.Infrastructure.Hubs;

namespace MiniCrm.Infrastructure.Services;

/// <summary>
/// Реализация броадкастинга событий реального времени для SignalR.
/// </summary>
public class LeadsHubService : ILeadsHubService
{
    private readonly IHubContext<LeadsHub> _hubContext;

    public LeadsHubService(IHubContext<LeadsHub> hubContext)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
    }

    public async Task NotifyLeadCreated(LeadDto lead, CancellationToken cancellationToken = default)
    {
        // Отправка клиентам события "OnLeadCreated"
        await _hubContext.Clients.All.SendAsync("OnLeadCreated", lead, cancellationToken);
    }

    public async Task NotifyLeadStatusChanged(Guid leadId, string nextStatus, CancellationToken cancellationToken = default)
    {
        // Отправка клиентам события "OnLeadStatusChanged"
        await _hubContext.Clients.All.SendAsync("OnLeadStatusChanged", new { LeadId = leadId, Status = nextStatus }, cancellationToken);
    }

    public async Task NotifyLeadCommentUpdated(Guid leadId, string comment, CancellationToken cancellationToken = default)
    {
        // Отправка клиентам события "OnLeadCommentUpdated"
        await _hubContext.Clients.All.SendAsync("OnLeadCommentUpdated", new { LeadId = leadId, Comment = comment }, cancellationToken);
    }

    public async Task NotifyLeadDeleted(Guid leadId, CancellationToken cancellationToken = default)
    {
        // Отправка клиентам события "OnLeadDeleted"
        await _hubContext.Clients.All.SendAsync("OnLeadDeleted", leadId, cancellationToken);
    }
}
