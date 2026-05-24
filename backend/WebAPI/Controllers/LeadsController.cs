using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MiniCrm.Application.DTOs;
using MiniCrm.Application.Leads.Commands.CreateLead;
using MiniCrm.Application.Leads.Commands.UpdateLeadStatus;
using MiniCrm.Application.Leads.Commands.DeleteLead;
using MiniCrm.Application.Leads.Queries.GetLeadsList;
using MiniCrm.Domain.Enums;

namespace MiniCrm.WebAPI.Controllers;

/// <summary>
/// REST API Контроллер для работы с лидами.
/// Использует паттерн Mediated Request (MediatR), выступая чисто как транспортный слой.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeadsController(IMediator mediator, ILogger<LeadsController> logger) : ControllerBase
{
    private readonly IMediator _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
    private readonly ILogger<LeadsController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

    /// <summary>
    /// Получить список всех заявок с поддержкой фильтрации по этапу воронки и поиском.
    /// </summary>
    /// <param name="status">Статус воронки (опционально)</param>
    /// <param name="searchTerm">Поисковый запрос по имени/телефону (опционально)</param>
    /// <param name="cancellationToken">Токен отмены асинхронной операции</param>
    /// <returns>Список DTO лидов</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<LeadDto>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<List<LeadDto>>> GetLeads(
        [FromQuery] LeadStatus? status,
        [FromQuery] string? searchTerm,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("HTTP GET: Запрос на получение списка лидов. Фильтр статус: {Status}, Поиск: '{SearchTerm}'", status, searchTerm);
        
        var query = new GetLeadsQuery { Status = status, SearchTerm = searchTerm };
        var result = await _mediator.Send(query, cancellationToken);
        
        _logger.LogInformation("HTTP GET: Возвращено {Count} лидов из базы данных.", result.Count);
        return Ok(result);
    }

    /// <summary>
    /// Создать и зарегистрировать в CRM новую заявку (Лид).
    /// </summary>
    /// <param name="command">Данные создаваемого лида</param>
    /// <param name="cancellationToken">Токен отмены асинхронной операции</param>
    /// <returns>Результат в виде DTO созданного лида</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(LeadDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<LeadDto>> CreateLead(
        [FromBody] CreateLeadCommand command,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("HTTP POST: Запрос на создание лида для клиента '{Name}'.", command?.Name);

        if (command == null)
        {
            _logger.LogWarning("HTTP POST: Теле запроса создания лида пусто.");
            return BadRequest(new { Message = "Данные запроса (команда создания лида) не представлены в теле запроса." });
        }

        if (string.IsNullOrWhiteSpace(command.Name))
        {
            _logger.LogWarning("HTTP POST: Валидация провалена - имя пустое.");
            return BadRequest(new { Message = "Контроллер-Валидация: Имя потенциального клиента обязательно к заполнению." });
        }

        if (string.IsNullOrWhiteSpace(command.Phone))
        {
            _logger.LogWarning("HTTP POST: Валидация провалена - телефон пустой.");
            return BadRequest(new { Message = "Контроллер-Валидация: Номер телефона обязателен для связи с клиентом." });
        }

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("HTTP POST: Неверное состояние ModelState у запроса для '{Name}'", command.Name);
            return BadRequest(ModelState);
        }

        try
        {
            var resultDto = await _mediator.Send(command, cancellationToken);
            _logger.LogInformation("HTTP POST: Лид '{Name}' успешно создан с ID {LeadId}.", resultDto.Name, resultDto.Id);
            return CreatedAtAction(nameof(GetLeads), new { id = resultDto.Id }, resultDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "HTTP POST: Бизнес-ошибка при создании лида: {Message}", ex.Message);
            return UnprocessableEntity(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Сменить текущий статус сделки (перевод на другой этап воронки продаж).
    /// </summary>
    /// <param name="id">Идентификатор UUID интересующего лида</param>
    /// <param name="command">Модифицирующий статус объект</param>
    /// <param name="cancellationToken">Токен отмены асинхронной операции</param>
    /// <returns>Обновленный объект лида</returns>
    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LeadDto))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<LeadDto>> UpdateStatus(
        Guid id,
        [FromBody] UpdateLeadStatusCommand command,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("HTTP PATCH: Запрос на обновление статуса лида {LeadId} до {Status}.", id, command?.Status);

        if (command == null)
        {
            _logger.LogWarning("HTTP PATCH: Тело запроса обновления этапа воронки пусто.");
            return BadRequest(new { Message = "Тело запроса обновления этапа воронки пусто или некорректно сформировано." });
        }

        if (id == Guid.Empty)
        {
            _logger.LogWarning("HTTP PATCH: Передан некорректный идентификатор (Empty Guid).");
            return BadRequest(new { Message = "Передан некорректный идентификатор ресурса (Empty Guid)." });
        }

        if (id != command.Id)
        {
            _logger.LogWarning("HTTP PATCH: Конфликт ID пути '{PathId}' и ID тела '{BodyId}'.", id, command.Id);
            return BadRequest(new { Message = $"Асинхронный конфликт идентификаторов. UUID пути '{id}' не совпадает с UUID тела '{command.Id}'." });
        }

        if (!ModelState.IsValid)
        {
            _logger.LogWarning("HTTP PATCH: Неверное состояние ModelState у запроса для ID {LeadId}.", id);
            return BadRequest(ModelState);
        }

        try
        {
            var resultDto = await _mediator.Send(command, cancellationToken);
            _logger.LogInformation("HTTP PATCH: Статус лида {LeadId} успешно обновлен до '{Status}'.", id, resultDto.Status);
            return Ok(resultDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "HTTP PATCH: Бизнес-блокировка статуса для лида {LeadId}: {Message}", id, ex.Message);
            return UnprocessableEntity(new { Message = ex.Message });
        }
    }

    /// <summary>
    /// Мягкое удаление сделки из CRM-системы (Soft Delete).
    /// </summary>
    /// <param name="id">UUID удаляемого лида</param>
    /// <param name="cancellationToken">Токен отмены асинхронной операции</param>
    /// <returns>HTTP результат без содержимого</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteLead(
        Guid id,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("HTTP DELETE: Запрос на мягкое удаление лида с ID {LeadId}.", id);

        if (id == Guid.Empty)
        {
            _logger.LogWarning("HTTP DELETE: Передан пустой идентификатор (Empty Guid).");
            return BadRequest(new { Message = "Передан некорректный идентификатор ресурса для удаления (Empty Guid)." });
        }

        var command = new DeleteLeadCommand { Id = id };
        await _mediator.Send(command, cancellationToken);
        
        _logger.LogInformation("HTTP DELETE: Лид {LeadId} успешно помечен как удаленный (IsDeleted = true).", id);
        return NoContent();
    }
}
