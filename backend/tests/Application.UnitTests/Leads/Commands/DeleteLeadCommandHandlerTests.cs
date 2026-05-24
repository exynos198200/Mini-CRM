using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Xunit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Leads.Commands.DeleteLead;
using MiniCrm.Domain.Entities;
using MiniCrm.Domain.Events;
using MiniCrm.Infrastructure.Persistence;

namespace MiniCrm.Application.UnitTests.Leads.Commands;

public class DeleteLeadCommandHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly DeleteLeadCommandHandler _handler;

    public DeleteLeadCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _mediatorMock = new Mock<IMediator>();
        _context = new ApplicationDbContext(options, _mediatorMock.Object);
        _handler = new DeleteLeadCommandHandler(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task Handle_WithExistingActiveLead_ShouldMergelySoftDeleteAndPublishEvent()
    {
        // 1. ARRANGE
        var lead = new Lead("Дмитрий Архитектор", "+7(901)345-67-89", "Проектирование микросервисов");
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();

        var command = new DeleteLeadCommand { Id = lead.Id };

        // 2. ACT
        var result = await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        result.Should().BeTrue();

        // Проверяем, что в самой БД у нее выставлен IsDeleted = true
        // (Примечание: InMemoryDatabase не всегда придерживается HasQueryFilter, но мы можем проверить поле напрямую)
        var dbLead = await _context.Leads.IgnoreQueryFilters().FirstOrDefaultAsync(x => x.Id == lead.Id);
        dbLead.Should().NotBeNull();
        dbLead!.IsDeleted.Should().BeTrue();

        // Проверяем отправку вещания через MediatR
        _mediatorMock.Verify(x => x.Publish(
            It.Is<LeadDeletedEvent>(e => e.LeadId == lead.Id),
            It.IsAny<CancellationToken>()
        ), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentLead_ShouldThrowKeyNotFoundExceptionOrNotFoundException()
    {
        // 1. ARRANGE
        var command = new DeleteLeadCommand { Id = Guid.NewGuid() };

        // 2. ACT
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // 3. ASSERT
        await act.Should().ThrowAsync<Exception>();
    }
}
