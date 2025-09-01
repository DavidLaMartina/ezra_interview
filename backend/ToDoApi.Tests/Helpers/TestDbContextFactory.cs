using Microsoft.EntityFrameworkCore;
using ToDoApi.Data;
using ToDoApi.Models;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Tests.Helpers;

public static class TestDbContextFactory
{
    public static ToDoDbContext CreateInMemoryContext(string? databaseName = null)
    {
        databaseName ??= Guid.NewGuid().ToString();
        
        var options = new DbContextOptionsBuilder<ToDoDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        var context = new ToDoDbContext(options);
        context.Database.EnsureCreated();
        
        return context;
    }

    public static ToDoDbContext CreateContextWithSampleData(string? databaseName = null)
    {
        var context = CreateInMemoryContext(databaseName);
        
        var tasks = new List<TaskItem>
        {
            new TaskItem
            {
                Id = 1,
                Title = "Test Task 1",
                Description = "Test Description 1",
                Status = TaskStatus.Pending,
                Priority = TaskPriority.High,
                Tags = "[\"test\", \"unit\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new TaskItem
            {
                Id = 2,
                Title = "Test Task 2",
                Description = "Test Description 2",
                Status = TaskStatus.Completed,
                Priority = TaskPriority.Medium,
                Tags = "[\"test\"]",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow
            },
            new TaskItem
            {
                Id = 3,
                Title = "Deleted Task",
                Description = "This task is soft deleted",
                Status = TaskStatus.Pending,
                Priority = TaskPriority.Low,
                Tags = "[]",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                UpdatedAt = DateTime.UtcNow.AddDays(-1),
                DeletedAt = DateTime.UtcNow.AddDays(-1)
            }
        };

        context.Tasks.AddRange(tasks);
        context.SaveChanges();
        
        return context;
    }
}