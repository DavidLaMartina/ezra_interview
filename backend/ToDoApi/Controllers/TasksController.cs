using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using ToDoApi.Data;
using ToDoApi.Models;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Controllers;

[Microsoft.AspNetCore.Authorization.Authorize]
[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ToDoDbContext _context;
    private readonly IValidator<CreateTaskRequest> _createTaskValidator;
    private readonly IValidator<UpdateTaskRequest> _updateTaskValidator;
    private readonly IValidator<BulkUpdateRequest> _bulkUpdateValidator;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        ToDoDbContext context,
        IValidator<CreateTaskRequest> createTaskValidator,
        IValidator<UpdateTaskRequest> updateTaskValidator,
        IValidator<BulkUpdateRequest> bulkUpdateValidator,
        ILogger<TasksController> logger)
    {
        _context = context;
        _createTaskValidator = createTaskValidator;
        _updateTaskValidator = updateTaskValidator;
        _bulkUpdateValidator = bulkUpdateValidator;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        return int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<TaskListResponse>>> GetTasks(
        [FromQuery] TaskStatus? status = null,
        [FromQuery] TaskPriority? priority = null,
        [FromQuery] string? search = null,
        [FromQuery] bool includeDeleted = false,
        [FromQuery] int? cursor = null,
        [FromQuery] int limit = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = "asc")
    {
        try
        {
            var userId = GetCurrentUserId();

            if (limit > 100) limit = 100;
            if (limit < 1) limit = 10;

            var validSortFields = new[] { "duedate", "created", "updated", "priority", "status", "title" };
            var validSortOrders = new[] { "asc", "desc" };

            if (!string.IsNullOrEmpty(sortBy) && !validSortFields.Contains(sortBy.ToLower()))
            {
                return BadRequest(ApiResponse<TaskListResponse>.ErrorResult(
                    $"Invalid sort field. Valid options: {string.Join(", ", validSortFields)}"));
            }

            if (!validSortOrders.Contains(sortOrder?.ToLower()))
            {
                sortOrder = "asc";
            }

            var query = _context.Tasks.Where(t => t.UserId == userId);

            if (!includeDeleted)
            {
                query = query.Where(t => t.DeletedAt == null);
            }

            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == priority.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t => t.Title.ToLower().Contains(search.ToLower()));
            }

            query = ApplySorting(query, sortBy, sortOrder);

            if (cursor.HasValue && !string.IsNullOrEmpty(sortBy))
            {
                query = ApplyCursorPagination(query, cursor.Value, sortBy, sortOrder);
            }
            else if (cursor.HasValue)
            {
                query = query.Where(t => t.Id > cursor.Value);
            }

            // query = query.OrderBy(t => t.Id);

            var tasks = await query.Take(limit + 1).ToListAsync();

            var hasNextPage = tasks.Count > limit;
            if (hasNextPage)
            {
                tasks.RemoveAt(tasks.Count - 1);
            }

            var nextCursor = hasNextPage && tasks.Any() ? tasks.Last().Id : (int?)null;

            var response = new TaskListResponse
            {
                Tasks = tasks,
                HasNextPage = hasNextPage,
                NextCursor = nextCursor,
                Limit = limit,
                SortBy = sortBy,
                SortOrder = sortOrder
            };

            _logger.LogInformation("Retrieved {Count} tasks for user {UserId} with sort: {SortBy} {SortOrder}", 
                tasks.Count, userId, sortBy, sortOrder);

            return Ok(ApiResponse<TaskListResponse>.SuccessResult(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks");
            return StatusCode(500, ApiResponse<TaskListResponse>.ErrorResult("Failed to retrieve tasks"));
        }
    }

    private IQueryable<TaskItem> ApplySorting(IQueryable<TaskItem> query, string? sortBy, string sortOrder)
    {
        if (string.IsNullOrEmpty(sortBy))
        {
            return query.OrderBy(t => t.Id); // Default sort by ID
        }

        var isDescending = sortOrder.ToLower() == "desc";

        return sortBy.ToLower() switch
        {
            "duedate" => isDescending 
                ? query.OrderByDescending(t => t.DueDate ?? DateTime.MaxValue).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.DueDate ?? DateTime.MaxValue).ThenBy(t => t.Id),
            "created" => isDescending 
                ? query.OrderByDescending(t => t.CreatedAt).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.CreatedAt).ThenBy(t => t.Id),
            "updated" => isDescending 
                ? query.OrderByDescending(t => t.UpdatedAt).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.UpdatedAt).ThenBy(t => t.Id),
            "priority" => isDescending 
                ? query.OrderByDescending(t => t.Priority).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.Priority).ThenBy(t => t.Id),
            "status" => isDescending 
                ? query.OrderByDescending(t => t.Status).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.Status).ThenBy(t => t.Id),
            "title" => isDescending 
                ? query.OrderByDescending(t => t.Title).ThenByDescending(t => t.Id)
                : query.OrderBy(t => t.Title).ThenBy(t => t.Id),
            _ => query.OrderBy(t => t.Id)
        };
    }

    private IQueryable<TaskItem> ApplyCursorPagination(IQueryable<TaskItem> query, int cursor, string sortBy, string sortOrder)
    {
        // For complex sorting with cursor pagination, we'll use ID-based cursor for simplicity
        // In production, you might want to implement keyset pagination based on the sort field
        return query.Where(t => t.Id > cursor);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskItem>>> GetTask(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse<TaskItem>.ErrorResult("Invalid task ID"));
            }

            var userId = GetCurrentUserId();

            var task = await _context.Tasks
                .Where(t => t.DeletedAt == null && t.UserId == userId)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(ApiResponse<TaskItem>.ErrorResult("Task not found"));
            }

            _logger.LogInformation("Retrieved task with ID: {TaskId} for user: {UserId}", id, userId);
            return Ok(ApiResponse<TaskItem>.SuccessResult(task));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task with ID: {TaskId}", id);
            return StatusCode(500, ApiResponse<TaskItem>.ErrorResult("Failed to retrieve task"));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskItem>>> CreateTask(CreateTaskRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();

            var validationResult = await _createTaskValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => new ValidationError
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();

                return BadRequest(ApiResponse<TaskItem>.ErrorResult("Validation failed", errors));
            }

            var task = new TaskItem
            {
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                DueDate = request.DueDate,
                Tags = request.Tags ?? "[]",
                UserId = userId
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new task with ID: {TaskId}", task.Id);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, 
                ApiResponse<TaskItem>.SuccessResult(task, "Task created successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
            return StatusCode(500, ApiResponse<TaskItem>.ErrorResult("Failed to create task"));
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse>> UpdateTask(int id, UpdateTaskRequest request)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResult("Invalid task ID"));
            }

            var userId = GetCurrentUserId();

            var validationResult = await _updateTaskValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => new ValidationError
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();

                return BadRequest(ApiResponse.ErrorResult("Validation failed", errors));
            }

            var task = await _context.Tasks
                .Where(t => t.DeletedAt == null && t.UserId == userId)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(ApiResponse.ErrorResult("Task not found"));
            }

            task.Title = request.Title;
            task.Description = request.Description;
            task.Status = request.Status; 
            task.Priority = request.Priority;
            task.DueDate = request.DueDate;
            task.Tags = request.Tags ?? "[]";
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated task with ID: {TaskId} for user: {UserId}", id, userId);
            return Ok(ApiResponse.SuccessResult("Task updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task with ID: {TaskId}", id);
            return StatusCode(500, ApiResponse.ErrorResult("Failed to update task"));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteTask(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResult("Invalid task ID"));
            }

            var userId = GetCurrentUserId();

            var task = await _context.Tasks
                .Where(t => t.DeletedAt == null && t.UserId == userId)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(ApiResponse.ErrorResult("Task not found"));
            }

            task.DeletedAt = DateTime.UtcNow;
            task.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted task with ID: {TaskId} for user: {UserId}", id, userId);
            return Ok(ApiResponse.SuccessResult("Task deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task with ID: {TaskId}", id);
            return StatusCode(500, ApiResponse.ErrorResult("Failed to delete task"));
        }
    }

    [HttpPost("{id}/restore")]
    public async Task<ActionResult<ApiResponse>> RestoreTask(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResult("Invalid task ID"));
            }

            var userId = GetCurrentUserId();

            var task = await _context.Tasks
                .Where(t => t.DeletedAt != null && t.UserId == userId)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(ApiResponse.ErrorResult("Deleted task not found"));
            }

            task.DeletedAt = null;
            task.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Restored task with ID: {TaskId}", id);
            return Ok(ApiResponse.SuccessResult("Task restored successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring task with ID: {TaskId}", id);
            return StatusCode(500, ApiResponse.ErrorResult("Failed to restore task"));
        }
    }

    [HttpPatch("bulk")]
    public async Task<ActionResult<ApiResponse>> BulkUpdate(BulkUpdateRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();

            var validationResult = await _bulkUpdateValidator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(e => new ValidationError
                {
                    Field = e.PropertyName,
                    Message = e.ErrorMessage
                }).ToList();

                return BadRequest(ApiResponse.ErrorResult("Validation failed", errors));
            }

            var tasks = await _context.Tasks
                .Where(t => request.TaskIds.Contains(t.Id) && t.DeletedAt == null && t.UserId == userId)
                .ToListAsync();

            if (!tasks.Any())
            {
                return NotFound(ApiResponse.ErrorResult("No tasks found to update"));
            }

            if (tasks.Count != request.TaskIds.Length)
            {
                var foundIds = tasks.Select(t => t.Id).ToList();
                var missingIds = request.TaskIds.Except(foundIds).ToList();
                _logger.LogWarning("User {UserId} attempted to access tasks they don't own: {TaskIds}", 
                    userId, string.Join(", ", missingIds));
                return BadRequest(ApiResponse.ErrorResult("Some tasks not found or not accessible"));
            }

            foreach (var task in tasks)
            {
                if (request.Status.HasValue)
                {
                    task.Status = request.Status.Value;
                }

                if (request.Delete == true)
                {
                    task.DeletedAt = DateTime.UtcNow;
                }

                task.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var action = request.Delete == true ? "deleted" : "updated";
            _logger.LogInformation("Bulk {Action} {Count} tasks for user: {UserId}", action, tasks.Count, userId);
            
            return Ok(ApiResponse.SuccessResult($"{tasks.Count} tasks {action} successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error performing bulk update");
            return StatusCode(500, ApiResponse.ErrorResult("Failed to perform bulk update"));
        }
    }
}