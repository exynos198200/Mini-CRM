using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Application.Common.Interfaces;

/// <summary>
/// Интерфейс контекста базы данных для инверсии зависимостей (Dependency Inversion).
/// Позволяет прикладному слою не зависеть напрямую от EF Core и осуществлять легкое мокание.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Lead> Leads { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
