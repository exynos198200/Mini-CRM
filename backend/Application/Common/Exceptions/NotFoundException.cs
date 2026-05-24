using System;

namespace MiniCrm.Application.Common.Exceptions;

/// <summary>
/// Исключение, выбрасываемое при отсутствии запрашиваемой сущности в базе данных.
/// Перехватывается глобальным ExceptionHandlingMiddleware для конвертации в ProblemDetails JSON (RFC 7807).
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException()
        : base() { }

    public NotFoundException(string message)
        : base(message) { }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException) { }

    public NotFoundException(string name, object key)
        : base($"Entity \"{name}\" ({key}) was not found.") { }
}
