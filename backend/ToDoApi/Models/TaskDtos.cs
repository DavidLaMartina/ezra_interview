using System.ComponentModel.DataAnnotations;

namespace ToDoApi.Models;

public class CreateTaskRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    public string? Tags { get; set; }
}

public class UpdateTaskRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public string? Tags { get; set; }
}

public class BulkUpdateRequest
{
    [Required]
    public int[] TaskIds { get; set; } = Array.Empty<int>();

    public TaskStatus? Status { get; set; }

    public bool? Delete { get; set; }
}