using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.DTOs;
using MiniCrm.Domain.Enums;

namespace MiniCrm.Application.Leads.Queries.GetLeadsList;

/// <summary>
/// CQRS Запрос на извлечение списка лидов с фильтрацией и текстовым поиском.
/// </summary>
public record GetLeadsQuery : IRequest<List<LeadDto>>
{
    public LeadStatus? Status { get; init; }
    public string? SearchTerm { get; init; }
}

/// <summary>
/// Обработчик MediatR для возврата списка лидов (без транзакционной нагрузки).
/// </summary>
public class GetLeadsQueryHandler : IRequestHandler<GetLeadsQuery, List<LeadDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLeadsQueryHandler(IApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<List<LeadDto>> Handle(GetLeadsQuery request, CancellationToken cancellationToken)
    {
        // Начинаем эффективный отслеживаемый запрос без трекинга объектов (оптимизация оперативной памяти и EF)
        var query = _context.Leads
            .AsNoTracking()
            .Where(x => !x.IsDeleted);

        // Фильтрация по статусу
        if (request.Status.HasValue)
        {
            query = query.Where(x => x.Status == request.Status.Value);
        }

        // Фильтрация по поисковой строке (по имени или телефону)
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var search = request.SearchTerm.Trim().ToLower();
            query = query.Where(x => 
                x.Name.ToLower().Contains(search) || 
                x.Phone.Contains(search));
        }

        // Выполняем запрос с сортировкой по новизне
        var entities = await query
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        // Превращаем результат в DTO список
        return entities.Select(LeadDto.FromEntity).ToList();
    }
}
