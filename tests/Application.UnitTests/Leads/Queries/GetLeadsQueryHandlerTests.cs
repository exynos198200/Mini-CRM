using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using MiniCrm.Application.Leads.Queries.GetLeadsList;
using MiniCrm.Domain.Entities;
using MiniCrm.Domain.Enums;
using MiniCrm.Infrastructure.Persistence;
using MediatR;
using Moq;
using Xunit;

namespace MiniCrm.Application.UnitTests.Leads.Queries;

public class GetLeadsQueryHandlerTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly GetLeadsQueryHandler _handler;

    public GetLeadsQueryHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mediatorMock = new Mock<IMediator>();
        _context = new ApplicationDbContext(options, mediatorMock.Object);
        _handler = new GetLeadsQueryHandler(_context);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    [Fact]
    public async Task Handle_ShouldReturnAllActiveLeadsOrderedByCreatedAtDescending()
    {
        // 1. ARRANGE
        var lead1 = new Lead("Иван Иванов", "+7(900)111-22-33", "Нужен проект API") { Status = LeadStatus.New };
        var lead2 = new Lead("Петр Петров", "+7(900)222-33-44", "Разработка под ключ b2b") { Status = LeadStatus.Contacted };
        var leadDeleted = new Lead("Удаленный Клиент", "+7(900)333-44-55", "Удалить");
        leadDeleted.SoftDelete();

        _context.Leads.AddRange(lead1, lead2, leadDeleted);
        await _context.SaveChangesAsync();

        var query = new GetLeadsQuery();

        // 2. ACT
        var result = await _handler.Handle(query, CancellationToken.None);

        // 3. ASSERT
        result.Should().HaveCount(2);
        result.Any(x => x.Name == "Удаленный Клиент").Should().BeFalse();
        result.First().Id.Should().Be(lead2.Id); // Descending order by CreatedAt / order of addition
    }

    [Fact]
    public async Task Handle_WithStatusFilter_ShouldReturnOnlyMatchingLeads()
    {
        // 1. ARRANGE
        var leadNew = new Lead("Иван Иванов", "+7(920)111-22-33", "Новый");
        var leadContacted = new Lead("Петр Петров", "+7(920)222-33-44", "Старый созвон");
        leadContacted.ChangeStatus(LeadStatus.Contacted);

        _context.Leads.AddRange(leadNew, leadContacted);
        await _context.SaveChangesAsync();

        var query = new GetLeadsQuery { Status = LeadStatus.Contacted };

        // 2. ACT
        var result = await _handler.Handle(query, CancellationToken.None);

        // 3. ASSERT
        result.Should().ContainSingle();
        result.Single().Name.Should().Be("Петр Петров");
    }

    [Fact]
    public async Task Handle_WithSearchTerm_ShouldReturnMatchingLeadsByNameOrPhone()
    {
        // 1. ARRANGE
        var lead1 = new Lead("Василий Программист", "+7(999)888-77-66", "Интеграция систем");
        var lead2 = new Lead("Ольга Дизайнер", "+7(912)345-67-89", "Макет под ключ");

        _context.Leads.AddRange(lead1, lead2);
        await _context.SaveChangesAsync();

        var queryNameSearch = new GetLeadsQuery { SearchTerm = "Дизайнер" };
        var queryPhoneSearch = new GetLeadsQuery { SearchTerm = "999888" };

        // 2. ACT
        var resultName = await _handler.Handle(queryNameSearch, CancellationToken.None);
        var resultPhone = await _handler.Handle(queryPhoneSearch, CancellationToken.None);

        // 3. ASSERT
        resultName.Should().ContainSingle();
        resultName.First().Name.Should().Be("Ольга Дизайнер");

        resultPhone.Should().ContainSingle();
        resultPhone.First().Name.Should().Be("Василий Программист");
    }
}
