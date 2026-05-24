using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Common.Interfaces;
using MiniCrm.Application.Leads.Commands.CreateLead;
using MiniCrm.Domain.Entities;
using MiniCrm.Domain.Enums;
using MiniCrm.Domain.Events;
using MiniCrm.Infrastructure.Persistence;
using FluentValidation.Results;

namespace MiniCrm.Application.UnitTests.Leads.Commands;

/// <summary>
/// Юнит-тесты для CreateLeadCommandHandler.
/// Использует встраиваемую БД в оперативной памяти (Entity Framework InMemory Database)
/// для подлинной интеграции запросов к БД без сложного и хрупкого переопределения моков.
/// </summary>
public class CreateLeadCommandHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly CreateLeadCommandHandler _handler;

    public CreateLeadCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mediatorMock = new Mock<IMediator>();
        _context = new ApplicationDbContext(options, _mediatorMock.Object);
        _handler = new CreateLeadCommandHandler(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldCreateLeadCalculateValueAndPublishEvent()
    {
        // 1. ARRANGE
        var command = new CreateLeadCommand
        {
            Name = "Евгений Романов",
            Phone = "+7 (995) 123-45-67",
            Comment = "Интересуется консалтингом по БД PostgreSQL под ключ b2b"
        };

        // 2. ACT
        var resultDto = await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        resultDto.Should().NotBeNull();
        resultDto.Id.Should().NotBeEmpty();
        resultDto.Name.Should().Be(command.Name);
        resultDto.Phone.Should().Be(command.Phone);
        resultDto.Comment.Should().Be(command.Comment);
        resultDto.Status.Should().Be(LeadStatus.New.ToString().ToUpperInvariant());
        
        // Математический расчет DealValue по херистике ключевых слов:
        // База 15000 + "под ключ" 100000 = 115000. Встречается "b2b", значит умножаем на 1.5 => 172500m
        resultDto.DealValue.Should().Be(172500m);

        // Проверяем прямое сохранение в СУБД
        var savedLead = await _context.Leads.FindAsync(resultDto.Id);
        savedLead.Should().NotBeNull();
        savedLead!.Name.Should().Be(command.Name);
        savedLead.DealValue.Should().Be(172500m);

        // Проверяем отправку доменного события через шину MediatR
        _mediatorMock.Verify(x => x.Publish(
            It.Is<LeadCreatedEvent>(e => e.Lead.Id == resultDto.Id), 
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task Handle_WithDuplicatePhone_ShouldThrowInvalidOperationException()
    {
        // 1. ARRANGE (создаем существующий лид с тем же номером в базе)
        var preExistingLead = new Lead("Алексей Прораб", "+7(900)123-45-67", "Тестовое обращение с API");
        _context.Leads.Add(preExistingLead);
        await _context.SaveChangesAsync();

        var command = new CreateLeadCommand
        {
            Name = "Второй Клиент Двойник",
            Phone = "+7(900)123-45-67", // Лид-дубликат
            Comment = "Попытка повторного создания"
        };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*уже зарегистрирована и обрабатывается*");

        // Убеждаемся, что второй лид не был добавлен в БД
        var leadsInDb = await _context.Leads.ToListAsync();
        leadsInDb.Should().HaveCount(1);
    }

    [Fact]
    public void Validator_WithInvalidFields_ShouldVerifyFluentValidationRules()
    {
        // 1. ARRANGE
        var validator = new CreateLeadCommandValidator();
        var command = new CreateLeadCommand
        {
            Name = "", // Не заполнено
            Phone = "не-телефон-вовсе", // Ошибка паттерна телефона
            Comment = "Тест валидатора"
        };

        // 2. ACT
        ValidationResult result = validator.Validate(command);

        // 3. ASSERT
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateLeadCommand.Name));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateLeadCommand.Phone));
    }
}
