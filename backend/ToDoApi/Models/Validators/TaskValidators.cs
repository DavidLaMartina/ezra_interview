using FluentValidation;

namespace ToDoApi.Models.Validators;

public class CreateTaskRequestValidator : AbstractValidator<CreateTaskRequest>
{
    public CreateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required")
            .MaximumLength(200)
            .WithMessage("Title must be less than 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description must be less than 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage("Priority must be a valid value (Low, Medium, High)");

        RuleFor(x => x.Tags)
            .Must(BeValidJsonArray)
            .WithMessage("Tags must be a valid JSON array")
            .When(x => !string.IsNullOrEmpty(x.Tags));
    }

    private bool BeValidJsonArray(string? tags)
    {
        if (string.IsNullOrEmpty(tags)) return true;
        
        try
        {
            var parsed = System.Text.Json.JsonSerializer.Deserialize<string[]>(tags);
            return parsed != null && parsed.All(tag => !string.IsNullOrWhiteSpace(tag));
        }
        catch
        {
            return false;
        }
    }
}

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .WithMessage("Title is required")
            .MaximumLength(200)
            .WithMessage("Title must be less than 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000)
            .WithMessage("Description must be less than 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid value (Pending, InProgress, Completed)");

        RuleFor(x => x.Priority)
            .IsInEnum()
            .WithMessage("Priority must be a valid value (Low, Medium, High)");

        RuleFor(x => x.DueDate)
            .GreaterThan(DateTime.Today.AddDays(-1))
            .WithMessage("Due date cannot be in the past")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.Tags)
            .Must(BeValidJsonArray)
            .WithMessage("Tags must be a valid JSON array")
            .When(x => !string.IsNullOrEmpty(x.Tags));
    }

    private bool BeValidJsonArray(string? tags)
    {
        if (string.IsNullOrEmpty(tags)) return true;
        
        try
        {
            var parsed = System.Text.Json.JsonSerializer.Deserialize<string[]>(tags);
            return parsed != null && parsed.All(tag => !string.IsNullOrWhiteSpace(tag));
        }
        catch
        {
            return false;
        }
    }
}

public class BulkUpdateRequestValidator : AbstractValidator<BulkUpdateRequest>
{
    public BulkUpdateRequestValidator()
    {
        RuleFor(x => x.TaskIds)
            .NotEmpty()
            .WithMessage("At least one task ID is required");

        RuleForEach(x => x.TaskIds)
            .GreaterThan(0)
            .WithMessage("Task IDs must be positive numbers");

        RuleFor(x => x.Status)
            .IsInEnum()
            .WithMessage("Status must be a valid value (Pending, InProgress, Completed)")
            .When(x => x.Status.HasValue);

        RuleFor(x => x)
            .Must(x => x.Status.HasValue || x.Delete.HasValue)
            .WithMessage("Either Status or Delete must be specified");
    }
}