using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;

namespace MiniCrm.WebAPI.Controllers;

public class LoginRequest
{
    public string Username { get; set; } = null!;
    public string Password { get; set; } = null!;
}

public class AuthResponse
{
    public string Token { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
}

/// <summary>
/// Контроллер аутентификации для демонстрации корпоративной безопасности и генерации токенов (JWT / Custom Token).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    /// <summary>
    /// Авторизация менеджера или администратора в CRM.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AuthResponse))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public ActionResult<AuthResponse> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest("Имя пользователя и пароль обязательны.");
        }

        var username = request.Username.Trim().ToLowerInvariant();

        // Простая ролевая модель для демонстрационного MVP
        if (username == "admin" && request.Password == "admin123")
        {
            return Ok(new AuthResponse
            {
                Token = "Mock-JWT-Header-Payload-AdminRole-2026",
                Username = "admin",
                Role = "Administrator",
                DisplayName = "Инна Новикова"
            });
        }
        else if (username == "manager" && request.Password == "manager123")
        {
            return Ok(new AuthResponse
            {
                Token = "Mock-JWT-Header-Payload-ManagerRole-2026",
                Username = "manager",
                Role = "Manager",
                DisplayName = "Евгений Романов"
            });
        }

        return Unauthorized(new { Message = "Неверный логин или пароль. Попробуйте admin/admin123 или manager/manager123" });
    }
}
