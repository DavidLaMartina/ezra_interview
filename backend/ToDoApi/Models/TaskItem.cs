using System.ComponentModel.DataAnnotations;

namespace ToDoApi.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.Pending;

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    public string Tags { get; set; } = "[]";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }

    public int UserId { get; set; }

    public User User { get; set; } = null!;
}

public enum TaskStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2
}

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}