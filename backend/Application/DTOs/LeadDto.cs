using System;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Application.DTOs;

/// <summary>
/// Транспортный DTO объект для передачи данных лида клиентам API.
/// </summary>
public record LeadDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = null!;
    public string Phone { get; init; } = null!;
    public string Status { get; init; } = null!;
    public string? Comment { get; init; }
    public decimal DealValue { get; init; }
    public DateTimeOffset CreatedAt { get; init; }
    public DateTimeOffset UpdatedAt { get; init; }

    /// <summary>
    /// Маппинг доменной сущности в DTO.
    /// </summary>
    public static LeadDto FromEntity(Lead lead)
    {
        return new LeadDto
        {
            Id = lead.Id,
            Name = lead.Name,
            Phone = lead.Phone,
            Status = lead.Status.ToString().ToUpperInvariant(),
            Comment = lead.Comment,
            DealValue = lead.DealValue,
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt
        };
    }
}
