using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoApi.Data;
using ToDoApi.Models;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ToDoDbContext _context;

    public TasksController(ToDoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<TaskListResponse>> GetTasks(
        [FromQuery] TaskStatus? status = null,
        [FromQuery] TaskPriority? priority = null,
        [FromQuery] string? search = null,
        [FromQuery] bool includeDeleted = false,
        [FromQuery] int? cursor = null,
        [FromQuery] int limit = 10)
    {
        if (limit > 100) limit = 100;
        if (limit < 1) limit = 10;

        var query = _context.Tasks.AsQueryable();

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
            query = query.Where(t => t.Title.Contains(search));
        }

        if (cursor.HasValue)
        {
            query = query.Where(t => t.Id > cursor.Value);
        }

        query = query.OrderBy(t => t.Id);

        var tasks = await query.Take(limit + 1).ToListAsync();

        var hasNextPage = tasks.Count > limit;
        if (hasNextPage)
        {
            tasks.RemoveAt(tasks.Count - 1);
        }

        var nextCursor = hasNextPage && tasks.Count > 0 ? tasks.Last().Id : (int?)null;

        return new TaskListResponse
        {
            Tasks = tasks,
            HasNextPage = hasNextPage,
            NextCursor = nextCursor,
            Limit = limit
        };
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItem>> GetTask(int id)
    {
        var task = await _context.Tasks
            .Where(t => t.DeletedAt == null)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        return task;
    }

    [HttpPost]
    public async Task<ActionResult<TaskItem>> CreateTask(CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            Tags = request.Tags ?? "[]"
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    // TODO: Edit this method so that an update only updates the properties actually passed in
    // e.g. not passing a description won't override the description, but passing a null or empty description will
    // Also TODO; Change this method to return an instance of the newly updated object,
    // similar to the create method's return of returning the newly crated object.
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskRequest request)
    {
        var task = await _context.Tasks
            .Where(t => t.DeletedAt == null)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = request.Status;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;
        task.Tags = request.Tags ?? "[]";
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks
            .Where(t => t.DeletedAt == null)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        task.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreTask(int id)
    {
        var task = await _context.Tasks
            .Where(t => t.DeletedAt != null)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        task.DeletedAt = null;
        task.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("bulk")]
    public async Task<IActionResult> BulkUpdate(BulkUpdateRequest request)
    {
        var tasks = await _context.Tasks
            .Where(t => request.TaskIds.Contains(t.Id) && t.DeletedAt == null)
            .ToListAsync();

        if (tasks.Count == 0) return NotFound();

        foreach (var task in tasks)
        {
            if (request.Status.HasValue) task.Status = request.Status.Value;
            if (request.Delete == true) task.DeletedAt = DateTime.UtcNow;

            task.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}