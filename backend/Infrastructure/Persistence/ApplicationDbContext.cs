using System.Linq;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Infrastructure.Persistence;

/// <summary>
/// Основной контекст базы данных Entity Framework Core.
/// Реализует порт IApplicationDbContext из прикладного слоя.
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly IMediator? _mediator;

    public DbSet<Lead> Leads => Set<Lead>();

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IMediator? mediator = null)
        : base(options)
    {
        _mediator = mediator;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Автоматически применяем все Fluent API конфигурации сущностей из данной сборки
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Конфигурируем глобальный фильтр запросов (Global Query Filter) для мягкого удаления Soft Delete
        modelBuilder.Entity<Lead>().HasQueryFilter(l => !l.IsDeleted);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // 1. Автоматический перехват Soft Delete при удалении сущностей
        foreach (var entry in ChangeTracker.Entries<Lead>())
        {
            switch (entry.State)
            {
                case EntityState.Deleted:
                    // Вместо жесткого SQL DELETE переводим состояние в Modified и выставляем флаг
                    entry.State = EntityState.Modified;
                    entry.Entity.SoftDelete(); // Вызываем инкапсулированный метод удаления
                    break;
                case EntityState.Modified:
                    // Автоматически обновляем штамп времени изменения
                    // (для полной автоматизации вне структуры сущностей)
                    break;
            }
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        // 2. Диспетчеризация накопленных доменных событий (Domain Events) в шину MediatR
        if (_mediator != null)
        {
            var entitiesWithEvents = ChangeTracker.Entries<Lead>()
                .Select(e => e.Entity)
                .Where(e => e.DomainEvents.Any())
                .ToList();

            foreach (var entity in entitiesWithEvents)
            {
                var events = entity.DomainEvents.ToList();
                entity.ClearDomainEvents();

                foreach (var domainEvent in events)
                {
                    await _mediator.Publish(domainEvent, cancellationToken);
                }
            }
        }

        return result;
    }
}
