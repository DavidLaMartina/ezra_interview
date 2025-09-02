using System.Text.Json;
using ToDoApi.Models;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ToDoDbContext context)
    {
        if (context.Tasks.Count() > 0 || context.Users.Count() > 0) return;

        var demoUser = new User
        {
            Name = "Demo User",
            Email = "demo@example.com",
            PasswordHash = HashPassword("Password123")
        };

        context.Users.Add(demoUser);
        await context.SaveChangesAsync();

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

        var tasks = seedData.Tasks.Select(seedTask => new TaskItem
        {
            Title = seedTask.Title,
            Description = seedTask.Description,
            Status = (TaskStatus)seedTask.Status,
            Priority = (TaskPriority)seedTask.Priority,
            Tags = seedTask.Tags ?? "[]",
            DueDate = seedTask.DueDate,
            DeletedAt = seedTask.DeletedAt,
            UserId = demoUser.Id
        }).ToList();

        context.Tasks.AddRange(tasks);
        await context.SaveChangesAsync();

        Console.WriteLine($"Seeded {tasks.Count} tasks into the database.");
    }

    // Simple hash for demo purposes
    private static string HashPassword(string password)
    {
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var salt = new byte[16];
        rng.GetBytes(salt);

        using var pbkdf2 = new System.Security.Cryptography.Rfc2898DeriveBytes(password, salt, 10000, System.Security.Cryptography.HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(32);

        var hashBytes = new byte[48];
        Array.Copy(salt, 0, hashBytes, 0, 16);
        Array.Copy(hash, 0, hashBytes, 16, 32);

        return Convert.ToBase64String(hashBytes);
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