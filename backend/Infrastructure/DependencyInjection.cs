using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Infrastructure.Persistence;
using MiniCrm.Infrastructure.Services;

namespace MiniCrm.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Получаем строку подключения из конфигурации ENV
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // 2. Регистрируем DbContext с использованием PostgreSQL провайдера
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString, builder => 
                builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // 3. Сопоставляем IApplicationDbContext с реальным сервисом
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

        // 4. Регистрируем SignalR сервисы рассылки
        services.AddScoped<ILeadsHubService, LeadsHubService>();

        return services;
    }
}
