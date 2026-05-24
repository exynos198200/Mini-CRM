using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using MiniCrm.Application.Common.Exceptions;

namespace MiniCrm.WebAPI.Middlewares;

/// <summary>
/// Глобальный Middleware для перехвата исключений на уровне HTTP конвейера.
/// Форматирует ошибки согласно спецификации RFC 7807 (Problem Details).
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Произошло необработанное исключение при обработке запроса: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, title, type) = exception switch
        {
            NotFoundException => (
                StatusCodes.Status404NotFound,
                "Ресурс не найден",
                "https://tools.ietf.org/html/rfc7231#section-6.5.4"
            ),
            InvalidOperationException => (
                StatusCodes.Status400BadRequest,
                "Нарушение бизнес-правил",
                "https://tools.ietf.org/html/rfc7231#section-6.5.1"
            ),
            ArgumentException => (
                StatusCodes.Status400BadRequest,
                "Некорректные параметры запроса",
                "https://tools.ietf.org/html/rfc7231#section-6.5.1"
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Внутренняя ошибка сервера",
                "https://tools.ietf.org/html/rfc7231#section-6.6.1"
            )
        };

        context.Response.StatusCode = statusCode;

        var problemDetails = new
        {
            Type = type,
            Title = title,
            Status = statusCode,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsJsonAsync(problemDetails, options);
    }
}
