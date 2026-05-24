using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.Common.Exceptions;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Application.Leads.Commands.DeleteLead;

/// <summary>
/// CQRS Команда на удаление (мягкое удаление Soft Delete) сделки.
/// </summary>
public record DeleteLeadCommand : IRequest<bool>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Обработчик удаления лида.
/// </summary>
public class DeleteLeadCommandHandler : IRequestHandler<DeleteLeadCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteLeadCommandHandler(IApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<bool> Handle(DeleteLeadCommand request, CancellationToken cancellationToken)
    {
        // 1. Поиск лида в БД (учитывая глобальный фильтр или проверяя IsDeleted)
        var entity = await _context.Leads.FindAsync(new object[] { request.Id }, cancellationToken);

        if (entity == null || entity.IsDeleted)
        {
            throw new NotFoundException(nameof(Lead), request.Id);
        }

        // 2. Вызов доменного метода для мягкого удаления
        entity.SoftDelete();

        // 3. Сохранение изменений (автоматически публикует LeadDeletedEvent)
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
