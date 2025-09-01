using System.Text.Json;
using ToDoApi.Models;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ToDoDbContext context)
    {
        if (context.Tasks.Count() > 0) return;

        var jsonPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "seed-data.json");
        if (!File.Exists(jsonPath))
        {
            Console.WriteLine($"Seed data file not found at: {jsonPath}");
            return;
        }

        var jsonContent = await File.ReadAllTextAsync(jsonPath);
        var seedData = JsonSerializer.Deserialize<SeedData>(jsonContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (seedData == null || seedData?.Tasks == null || seedData?.Tasks.Count() == 0)
        {
            Console.WriteLine("No tasks found in seed data");
            return;
        }

        var tasks = seedData!.Tasks.Select(seedTask => new TaskItem
        {
            Title = seedTask.Title,
            Description = seedTask.Description,
            Status = (TaskStatus)seedTask.Status,
            Priority = (TaskPriority)seedTask.Priority,
            Tags = seedTask.Tags ?? "[]",
            DueDate = seedTask.DueDate,
            DeletedAt = seedTask.DeletedAt
        }).ToList();

        context.Tasks.AddRange(tasks);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {tasks.Count} tasks into the database.");
    }
}

public class SeedData
{
    public List<SeedTask> Tasks { get; set; } = [];
}

public class SeedTask
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Status { get; set; }
    public int Priority { get; set; }
    public string? Tags { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? DeletedAt { get; set; }
}