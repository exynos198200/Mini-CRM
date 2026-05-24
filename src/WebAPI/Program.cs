using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MiniCrm.Application;
using MiniCrm.Application.Common.Exceptions;
using MiniCrm.Infrastructure;
using MiniCrm.Infrastructure.Hubs;
using MiniCrm.WebAPI.Middlewares;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// 1. Подключаем сервисы Clean Architecture слоев
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Настраиваем сериализацию JSON (CamelCase, String Enums)
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// 3. Подключаем SignalR для обновлений реального времени
builder.Services.AddSignalR();

// 4. Добавляем Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "Mini-CRM App API", Version = "v1" });
});

// 5. Настраиваем CORS политику под React SPA
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactSpa", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Необходмио для устойчивого SignalR WebSockets соединения
    });
});

var app = builder.Build();

// 6. Глобальный хэндлер непредвиденных исключений (RFC 7807) melalui Custom Middleware
app.UseMiddleware<ExceptionHandlingMiddleware>();

// 7. Включаем Swagger в режиме разработки и в контейнерах
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mini-CRM API v1");
    c.RoutePrefix = string.Empty; // Делаем Swagger стартовой страницей WebAPI
});

app.UseHttpsRedirection();
app.UseRouting();

// Применяем CORS
app.UseCors("AllowReactSpa");

// Подключаем кастомную ролевую авторизацию токенов Bearer
app.UseMiddleware<AuthorizationMiddleware>();

// 8. Маппим контроллеры и WebSocket-хабы SignalR
app.MapControllers();
app.MapHub<LeadsHub>("/hubs/leads");

app.Run();
