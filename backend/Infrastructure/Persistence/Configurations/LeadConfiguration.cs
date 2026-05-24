using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MiniCrm.Domain.Entities;

namespace MiniCrm.Infrastructure.Persistence.Configurations;

/// <summary>
/// Кастомная Fluent API конфигурация структуры таблицы PostgreSQL для сущности Lead.
/// Исключает загрязнение доменной модели сущностей атрибутами данных.
/// </summary>
public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        // Установка имени таблицы
        builder.ToTable("leads");

        // Установка первичного ключа
        builder.HasKey(x => x.Id);

        // Конфигурация полей
        builder.Property(x => x.Id)
            .ValueGeneratedNever()
            .HasColumnName("id");

        builder.Property(x => x.Name)
            .HasMaxLength(150)
            .IsRequired()
            .HasColumnName("name");

        builder.Property(x => x.Phone)
            .HasMaxLength(25)
            .IsRequired()
            .HasColumnName("phone");

        // Маппинг C# Enum в PostgreSQL Text/Varchar для человекочитаемости и гибкости миграций
        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .IsRequired()
            .HasColumnName("status");

        builder.Property(x => x.Comment)
            .HasColumnName("comment");

        builder.Property(x => x.DealValue)
            .HasPrecision(18, 2)
            .HasDefaultValue(15000.00m)
            .IsRequired()
            .HasColumnName("deal_value");

        builder.Property(x => x.IsDeleted)
            .HasDefaultValue(false)
            .HasColumnName("is_deleted");

        builder.Property(x => x.CreatedAt)
            .IsRequired()
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .IsRequired()
            .HasColumnName("updated_at");

        // Глобальный фильтр запросов для реализации автоматического Soft Delete
        builder.HasQueryFilter(x => !x.IsDeleted);

        // Создание индексов для оптимизации выборок
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Phone);
        
        // Индекс создания записи по убыванию (для пагинации)
        builder.HasIndex(x => x.CreatedAt);
    }
}
