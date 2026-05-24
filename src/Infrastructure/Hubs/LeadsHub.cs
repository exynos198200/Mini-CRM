using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace MiniCrm.Infrastructure.Hubs;

/// <summary>
/// Hub SignalR для бродкастинга изменений воронки продаж.
/// Клиенты подписываются на события для мгновенного обновления Kanban-доски и таблиц.
/// </summary>
public class LeadsHub : Hub
{
    private static int _activeManagersCount = 0;

    /// <summary>
    /// Срабатывает при подключении нового клиента (менеджера).
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        Interlocked.Increment(ref _activeManagersCount);
        
        // Отправляем всем обновленное количество менеджеров в сети
        await Clients.All.SendAsync("OnOnlineManagersChanged", _activeManagersCount);
        
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Срабатывает при отключении клиента.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Interlocked.Decrement(ref _activeManagersCount);
        
        // Предотвращаем отрицательные значения и уведомляем клиентов
        var currentCount = Math.Max(0, _activeManagersCount);
        await Clients.All.SendAsync("OnOnlineManagersChanged", currentCount);
        
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Пример метода, вызываемого клиентом для ручного информирования о начале просмотра карточки лида.
    /// </summary>
    public async Task JoinLeadGroup(string leadId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"lead_{leadId}");
        
        // Также отправляем локальное подтверждение в чат/логи
        await Clients.Caller.SendAsync("OnGroupJoined", $"Успешная подписка на обновления лида {leadId}");
    }

    public async Task LeaveLeadGroup(string leadId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"lead_{leadId}");
        await Clients.Caller.SendAsync("OnGroupLeft", $"Отписка от лида {leadId}");
    }

    /// <summary>
    /// Бродкастинг лога активности от менеджера всем клиентам для демонстрации совместной работы в реальном времени.
    /// </summary>
    public async Task SendActivity(string managerName, string actionDetails)
    {
        var formattedMsg = $"[{DateTime.UtcNow:HH:mm:ss}] Менеджер {managerName}: {actionDetails}";
        await Clients.All.SendAsync("OnActivityBroadcasted", formattedMsg);
    }
}
