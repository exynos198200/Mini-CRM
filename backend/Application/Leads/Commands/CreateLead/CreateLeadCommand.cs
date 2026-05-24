using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.DTOs;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Application.Leads.Commands.CreateLead;

/// <summary>
/// CQRS Команда на создание нового лида.
/// </summary>
public record CreateLeadCommand : IRequest<LeadDto>
{
    public string Name { get; init; } = null!;
    public string Phone { get; init; } = null!;
    public string? Comment { get; init; }
}

/// <summary>
/// FluentValidation правила валидации входящих полей при создании лида.
/// </summary>
public class CreateLeadCommandValidator : AbstractValidator<CreateLeadCommand>
{
    public CreateLeadCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Имя клиента обязательно к заполнению.")
            .MaximumLength(150).WithMessage("Имя не должно превышать 150 символов.");

        RuleFor(v => v.Phone)
            .NotEmpty().WithMessage("Номер телефона обязателен к заполнению.")
            .Matches(@"^(\+7|8|7)?[-. ]?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{2}[-. ]?\d{2}$")
            .WithMessage("Некорректный формат номера телефона РФ. Пример: +7(999)123-45-67");
    }
}

/// <summary>
/// Обработчик команды MediatR для создания лида.
/// </summary>
public class CreateLeadCommandHandler : IRequestHandler<CreateLeadCommand, LeadDto>
{
    private readonly IApplicationDbContext _context;

    // Внедрение зависимостей через конструктор (DI)
    public CreateLeadCommandHandler(IApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    private string GetDigitsOnly(string phone)
    {
        if (string.IsNullOrEmpty(phone)) return string.Empty;
        var sb = new System.Text.StringBuilder();
        foreach (var c in phone)
        {
            if (char.IsDigit(c)) sb.Append(c);
        }
        var raw = sb.ToString();
        return raw.Length > 10 ? raw[^10..] : raw;
    }

    public async Task<LeadDto> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        // 1. Проверяем дубликаты по номеру телефона среди активных (не удаленных) заявок
        var rawPhoneDigits = GetDigitsOnly(request.Phone);
        var activeLeads = await _context.Leads.Where(l => !l.IsDeleted).ToListAsync(cancellationToken);
        var isDuplicate = activeLeads.Any(l => GetDigitsOnly(l.Phone) == rawPhoneDigits);
        if (isDuplicate)
        {
            throw new InvalidOperationException($"Бизнес-правило: Заявка с номером телефона '{request.Phone.Trim()}' уже зарегистрирована и обрабатывается в CRM БД.");
        }

        // 2. Создаем доменную модель (внутри конструктора проверяются инварианты)
        var entity = new Lead(request.Name, request.Phone, request.Comment);

        // 3. Добавляем сущность в контекст БД
        _context.Leads.Add(entity);

        // 4. Сохраняем транзакцию в PostgreSQL (здесь же публикуются Domain Events)
        await _context.SaveChangesAsync(cancellationToken);

        // 5. Маппим сущность в DTO для сетевого ответа
        return LeadDto.FromEntity(entity);
    }
}
