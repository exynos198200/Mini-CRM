using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.Common.Exceptions;
using MiniCrm.Application.DTOs;
using MiniCrm.Domain.Enums;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Application.Leads.Commands.UpdateLeadStatus;

/// <summary>
/// CQRS Команда на смену статуса сделки.
/// </summary>
public record UpdateLeadStatusCommand : IRequest<LeadDto>
{
    public Guid Id { get; init; }
    public LeadStatus Status { get; init; }
}

/// <summary>
/// Обработчик смены статуса.
/// </summary>
public class UpdateLeadStatusCommandHandler : IRequestHandler<UpdateLeadStatusCommand, LeadDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateLeadStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<LeadDto> Handle(UpdateLeadStatusCommand request, CancellationToken cancellationToken)
    {
        // 1. Поиск лида в БД (включая консистентность по первичному ключу)
        var entity = await _context.Leads.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null || entity.IsDeleted)
        {
            throw new NotFoundException(nameof(Lead), request.Id);
        }

        // 2. Вызов доменного метода для изменения статуса сделки
        entity.ChangeStatus(request.Status);

        // 3. Сохранение изменений
        await _context.SaveChangesAsync(cancellationToken);

        return LeadDto.FromEntity(entity);
    }
}
