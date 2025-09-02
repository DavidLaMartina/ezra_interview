using Microsoft.AspNetCore.Mvc;
using ToDoApi.Models;
using ToDoApi.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;

namespace ToDoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IValidator<LoginRequest> _loginValidator;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IAuthService authService,
        IValidator<LoginRequest> loginValidator,
        IValidator<RegisterRequest> registerValidator,
        ILogger<AuthController> logger)
    {
        _authService = authService;
        _loginValidator = loginValidator;
        _registerValidator = registerValidator;
        _logger = logger;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        try
        {
            // Validate request
            var validationResult = await _loginValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => new ValidationError
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();

                return BadRequest(ApiResponse<AuthResponse>.ErrorResult("Validation failed", errors));
            }

            var authResponse = await _authService.LoginAsync(request);
            if (authResponse == null)
            {
                return BadRequest(ApiResponse<AuthResponse>.ErrorResult("Invalid email or password"));
            }

            return Ok(ApiResponse<AuthResponse>.SuccessResult(authResponse, "Login successful"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, ApiResponse<AuthResponse>.ErrorResult("An error occurred during login"));
        }
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest request)
    {
        try
        {
            // Validate request
            var validationResult = await _registerValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => new ValidationError
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();

                return BadRequest(ApiResponse<AuthResponse>.ErrorResult("Validation failed", errors));
            }

            var authResponse = await _authService.RegisterAsync(request);
            if (authResponse == null)
            {
                return BadRequest(ApiResponse<AuthResponse>.ErrorResult("A user with this email already exists"));
            }

            return CreatedAtAction(nameof(Login), null, 
                ApiResponse<AuthResponse>.SuccessResult(authResponse, "Registration successful"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, ApiResponse<AuthResponse>.ErrorResult("An error occurred during registration"));
        }
    }

    // GET: api/auth/me
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public ActionResult<ApiResponse<UserInfo>> GetCurrentUser()
    {
        try
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "";
            var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";

            var userInfo = new UserInfo
            {
                Id = userId,
                Name = userName,
                Email = userEmail
            };

            return Ok(ApiResponse<UserInfo>.SuccessResult(userInfo));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, ApiResponse<UserInfo>.ErrorResult("An error occurred"));
        }
    }
}