using FluentAssertions;
using ToDoApi.Models;
using ToDoApi.Models.Validators;
using Xunit;
using TaskStatus = ToDoApi.Models.TaskStatus;

namespace ToDoApi.Tests.Unit;

public class ValidationTests
{
    [Fact]
    public void CreateTaskRequestValidator_ValidRequest_ShouldPass()
    {
        var validator = new CreateTaskRequestValidator();
        var request = new CreateTaskRequest
        {
            Title = "Valid Task",
            Description = "Valid description",
            Priority = TaskPriority.Medium,
            DueDate = DateTime.Today.AddDays(1),
            Tags = "[\"tag1\", \"tag2\"]"
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void CreateTaskRequestValidator_EmptyTitle_ShouldFail()
    {
        var validator = new CreateTaskRequestValidator();
        var request = new CreateTaskRequest
        {
            Title = "",
            Priority = TaskPriority.Medium
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == nameof(request.Title));
        result.Errors.First().ErrorMessage.Should().Be("Title is required");
    }

    [Fact]
    public void CreateTaskRequestValidator_TitleTooLong_ShouldFail()
    {
        var validator = new CreateTaskRequestValidator();
        var request = new CreateTaskRequest
        {
            Title = new string('a', 201), // 201 characters
            Priority = TaskPriority.Medium
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == nameof(request.Title));
        result.Errors.First().ErrorMessage.Should().Be("Title must be less than 200 characters");
    }

    [Fact]
    public void CreateTaskRequestValidator_InvalidJsonTags_ShouldFail()
    {
        var validator = new CreateTaskRequestValidator();
        var request = new CreateTaskRequest
        {
            Title = "Valid Task",
            Priority = TaskPriority.Medium,
            Tags = "invalid json"
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == nameof(request.Tags));
        result.Errors.First().ErrorMessage.Should().Be("Tags must be a valid JSON array");
    }

    [Fact]
    public void UpdateTaskRequestValidator_ValidRequest_ShouldPass()
    {
        var validator = new UpdateTaskRequestValidator();
        var request = new UpdateTaskRequest
        {
            Title = "Updated Task",
            Description = "Updated description",
            Status = TaskStatus.InProgress,
            Priority = TaskPriority.High,
            DueDate = DateTime.Today.AddDays(2),
            Tags = "[\"updated\"]"
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void BulkUpdateRequestValidator_ValidRequest_ShouldPass()
    {
        var validator = new BulkUpdateRequestValidator();
        var request = new BulkUpdateRequest
        {
            TaskIds = new[] { 1, 2, 3 },
            Status = TaskStatus.Completed
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeTrue();
        result.Errors.Should().BeEmpty();
    }

    [Fact]
    public void BulkUpdateRequestValidator_EmptyTaskIds_ShouldFail()
    {
        var validator = new BulkUpdateRequestValidator();
        var request = new BulkUpdateRequest
        {
            TaskIds = Array.Empty<int>(),
            Status = TaskStatus.Completed
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().ContainSingle(e => e.PropertyName == nameof(request.TaskIds));
    }

    [Fact]
    public void BulkUpdateRequestValidator_NoStatusOrDelete_ShouldFail()
    {
        var validator = new BulkUpdateRequestValidator();
        var request = new BulkUpdateRequest
        {
            TaskIds = new[] { 1, 2 }
        };
        var result = validator.Validate(request);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.ErrorMessage == "Either Status or Delete must be specified");
    }
}