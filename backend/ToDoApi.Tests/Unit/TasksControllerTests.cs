using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Add this line
using Moq;
using ToDoApi.Controllers;
using ToDoApi.Data;
using ToDoApi.Models;
using ToDoApi.Models.Validators;
using ToDoApi.Tests.Helpers;
using Xunit;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Tests.Unit;

public class TasksControllerTests : IDisposable
{
    private readonly ToDoDbContext _context;
    private readonly TasksController _controller;
    private readonly Mock<ILogger<TasksController>> _mockLogger;

    public TasksControllerTests()
    {
        _context = TestDbContextFactory.CreateContextWithSampleData();
        _mockLogger = new Mock<ILogger<TasksController>>();
        
        _controller = new TasksController(
            _context,
            new CreateTaskRequestValidator(),
            new UpdateTaskRequestValidator(),
            new BulkUpdateRequestValidator(),
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task GetTasks_WithoutFilters_ShouldReturnAllActiveTasks()
    {
        // Act
        var result = await _controller.GetTasks();

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<TaskListResponse>>().Subject;
        
        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Tasks.Should().HaveCount(2); // Only non-deleted tasks
        response.Data.Tasks.Should().NotContain(t => t.DeletedAt.HasValue);
    }

    [Fact]
    public async Task GetTask_WithValidId_ShouldReturnTask()
    {
        // Act
        var result = await _controller.GetTask(1);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var response = okResult.Value.Should().BeOfType<ApiResponse<TaskItem>>().Subject;
        
        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Id.Should().Be(1);
        response.Data.Title.Should().Be("Test Task 1");
    }

    [Fact]
    public async Task GetTask_WithInvalidId_ShouldReturnNotFound()
    {
        // Act
        var result = await _controller.GetTask(999);

        // Assert
        var notFoundResult = result.Result.Should().BeOfType<NotFoundObjectResult>().Subject;
        var response = notFoundResult.Value.Should().BeOfType<ApiResponse<TaskItem>>().Subject;
        
        response.Success.Should().BeFalse();
        response.Message.Should().Be("Task not found");
    }

    [Fact]
    public async Task CreateTask_WithValidRequest_ShouldCreateTask()
    {
        // Arrange
        var request = new CreateTaskRequest
        {
            Title = "New Task",
            Description = "New Description",
            Priority = TaskPriority.High,
            Tags = "[\"new\"]"
        };

        // Act
        var result = await _controller.CreateTask(request);

        // Assert
        var createdResult = result.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
        var response = createdResult.Value.Should().BeOfType<ApiResponse<TaskItem>>().Subject;
        
        response.Success.Should().BeTrue();
        response.Data.Should().NotBeNull();
        response.Data!.Title.Should().Be("New Task");
        
        // Verify task was saved to database
        var savedTask = await _context.Tasks.FindAsync(response.Data.Id);
        savedTask.Should().NotBeNull();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}