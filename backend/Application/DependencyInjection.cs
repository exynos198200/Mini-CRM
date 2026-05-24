using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;

namespace MiniCrm.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Регистрируем FluentValidation валидаторы из сборки
        services.AddValidatorsFromAssembly(assembly);

        // Регистрируем обработчики команд/запросов MediatR
        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(assembly);
        });

        return services;
    }
}
