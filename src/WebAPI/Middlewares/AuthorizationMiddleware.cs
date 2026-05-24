using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace MiniCrm.WebAPI.Middlewares;

/// <summary>
/// Кастомный Middleware для имитации и проверки Bearer токенов на REST API.
/// Позволяет защитить роуты без утяжеления MVP сложными внешними провайдерами авторизации.
/// </summary>
public class AuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthorizationMiddleware> _logger;

    public AuthorizationMiddleware(RequestDelegate next, ILogger<AuthorizationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Пропускаем Swagger, методы авторизации, хабы SignalR и GET-запросы на здоровье/справку
        if (path.StartsWith("/api/auth") || 
            path.StartsWith("/hubs") || 
            path == "/" || 
            path.Contains("swagger") || 
            context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        // Проверяем наличие заголовка Authorization
        if (!context.Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            _logger.LogWarning("Попытка неавторизованного доступа к {Path} без заголовка Authorization", path);
            await ReturnUnauthorized(context, "Заголовок 'Authorization' отсутствует в запросе.");
            return;
        }

        var tokenString = authHeader.ToString();
        if (!tokenString.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Токен авторизации на {Path} имеет неверный формат (ожидался Bearer)", path);
            await ReturnUnauthorized(context, "Токен авторизации должен использовать схему 'Bearer'.");
            return;
        }

        var tokenValue = tokenString["Bearer ".Length..].Trim();
        if (string.IsNullOrWhiteSpace(tokenValue) || !tokenValue.StartsWith("Mock-JWT-", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Предоставлен недействительный или истекший сессионный токен на {Path}", path);
            await ReturnUnauthorized(context, "Передан недействительный или истекший токен сессии CRM.");
            return;
        }

        // Если токен валидный, то извлекаем роль менеджера
        var isAdministrator = tokenValue.Contains("AdminRole");
        context.Items["UserRole"] = isAdministrator ? "Administrator" : "Manager";
        context.Items["Username"] = isAdministrator ? "admin" : "manager";

        // Бизнес-правило безопасности: только Администраторы могут удалять лиды
        if (context.Request.Method.Equals("DELETE", StringComparison.OrdinalIgnoreCase) && !isAdministrator)
        {
            _logger.LogWarning("Пользователь с ролью Manager пытался выполнить DELETE операцию на {Path}", path);
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new
            {
                Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
                Title = "Доступ заблокирован",
                Status = StatusCodes.Status403Forbidden,
                Detail = "Бизнес-правило безопасности: только пользователи с правами 'Administrator' могут удалять сделки из базы.",
                Instance = path
            }, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            return;
        }

        _logger.LogInformation("Успешная авторизованная сессия: {User} ({Role}) на {Path}", 
            context.Items["Username"], context.Items["UserRole"], path);

        await _next(context);
    }

    private static async Task ReturnUnauthorized(HttpContext context, string detail)
    {
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        context.Response.ContentType = "application/json";

        var problemDetails = new
        {
            Type = "https://tools.ietf.org/html/rfc7235#section-3.1",
            Title = "Требуется авторизация",
            Status = StatusCodes.Status401Unauthorized,
            Detail = detail,
            Instance = context.Request.Path.Value
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsJsonAsync(problemDetails, options);
    }
}
