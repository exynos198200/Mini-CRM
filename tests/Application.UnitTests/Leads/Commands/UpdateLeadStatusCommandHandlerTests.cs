using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.Leads.Commands.UpdateLeadStatus;
using MiniCrm.Application.Common.Exceptions;
using MiniCrm.Domain.Entities;
using MiniCrm.Domain.Enums;
using MiniCrm.Domain.Events;
using MiniCrm.Infrastructure.Persistence;

namespace MiniCrm.Application.UnitTests.Leads.Commands;

/// <summary>
/// Юнит-тесты для UpdateLeadStatusCommandHandler.
/// Проверяет сложные регламенты переходов сделок по этапам воронки продаж.
/// </summary>
public class UpdateLeadStatusCommandHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly UpdateLeadStatusCommandHandler _handler;

    public UpdateLeadStatusCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mediatorMock = new Mock<IMediator>();
        _context = new ApplicationDbContext(options, _mediatorMock.Object);
        _handler = new UpdateLeadStatusCommandHandler(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task Handle_WithExistingLeadAndValidTransition_ShouldChangeStatusAndTriggerSignalRBroadcast()
    {
        // 1. ARRANGE
        var lead = new Lead("Дмитрий Шахов", "+7 (911) 555-55-11", "Интересуется готовой лицензией CRM");
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new UpdateLeadStatusCommand
        {
            Id = lead.Id,
            Status = LeadStatus.Qualified
        };

        // 2. ACT
        var resultDto = await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        resultDto.Should().NotBeNull();
        resultDto.Status.Should().Be(LeadStatus.Qualified.ToString().ToUpperInvariant());

        var dbLead = await _context.Leads.FindAsync(lead.Id);
        dbLead!.Status.Should().Be(LeadStatus.Qualified);

        // Проверяем отправку доменного события через шину MediatR
        _mediatorMock.Verify(x => x.Publish(
            It.Is<LeadStatusChangedEvent>(e => e.Lead.Id == lead.Id && e.NewStatus == LeadStatus.Qualified), 
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistingLead_ShouldThrowNotFoundException()
    {
        // 1. ARRANGE
        var nonExistingLeadId = Guid.NewGuid();
        var command = new UpdateLeadStatusCommand
        {
            Id = nonExistingLeadId,
            Status = LeadStatus.Won
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_TransitionToLostWithoutComment_ShouldThrowInvalidOperationException()
    {
        // 1. ARRANGE
        var lead = new Lead("Екатерина Миронова", "+7 (911) 444-44-44", null); // Нет комментария менеджера
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new UpdateLeadStatusCommand
        {
            Id = lead.Id,
            Status = LeadStatus.Lost // Переводим в проигранную
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT (Проверяем блокировку перехода бизнес-правилом)
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*требует содержательного комментария менеджера с указанием причины отказа*");
    }

    [Fact]
    public async Task Handle_TransitionToLostWithShortComment_ShouldThrowInvalidOperationException()
    {
        // 1. ARRANGE
        var lead = new Lead("Антон Соболев", "+7 (911) 333-33-33", "Краткий коммент"); // Меньше 15 символов
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new UpdateLeadStatusCommand
        {
            Id = lead.Id,
            Status = LeadStatus.Lost
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*требует содержательного комментария менеджера с указанием причины отказа (не менее 15 символов)*");
    }

    [Fact]
    public async Task Handle_AttemptToReopenClosedWonLead_ShouldThrowInvalidOperationException()
    {
        // 1. ARRANGE
        var lead = new Lead("Сергей Дорин", "+7 (911) 222-22-22", "Договор на разработку API подписан");
        lead.ChangeStatus(LeadStatus.Won); // Переводим в финальный статус
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new UpdateLeadStatusCommand
        {
            Id = lead.Id,
            Status = LeadStatus.New // Попытка вернуть в начало воронки
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Нельзя возвращать закрытую сделку*обратно в начальный статус*");
    }

    [Fact]
    public async Task Handle_DirectTransitionFromWonToLost_ShouldBeBlockedByBusinessRule()
    {
        // 1. ARRANGE
        var lead = new Lead("Олег Петров", "+7 (911) 111-11-11", "Оплата поступила в банк. Успешная поставка.");
        lead.ChangeStatus(LeadStatus.Won);
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new UpdateLeadStatusCommand
        {
            Id = lead.Id,
            Status = LeadStatus.Lost // Попытка перевести выигранную сделку в проигранную
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Выигранная сделка была успешно завершена. Прямая смена статуса на 'Проиграна' заблокирована.*");
    }

    [Fact]
    public async Task Handle_TransitionToWonWithLowValue_ShouldThrowInvalidOperationException()
    {
        // 1. ARRANGE
        var lead = new Lead("Анна Давыдова", "+7 (911) 777-77-77", "Базовый контакт"); // Базовая сумма 15000
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new UpdateLeadStatusCommand
        {
            Id = lead.Id,
            Status = LeadStatus.Won // Попытка закрыть без высокой ценности (меньше или равно 15000)
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Невозможно перевести лид в статус 'Выиграна' (Won) без ценности сделки*");
    }
}
