using System.ComponentModel.DataAnnotations;




public class User
{
    public string? Id { get; set; }

    [Required]
    public required string FullName { get; set; }

    [Required]
    public required string Password { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    public List<string> CalendarItems { get; set; } = new List<string>();

    // New Properties for User Profile Facts
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? FamilyHistoryDementia { get; set; }
    public string? LifestyleHabits { get; set; }
    public string? MedicalConditions { get; set; }
    public string? PrimaryBrainHealthConcern { get; set; }
    public string? PreferredCommunicationStyle { get; set; }
    public string? CurrentMedications { get; set; } // Example: "Donepezil, Vitamin D"
    public string? SleepPatterns { get; set; } // Example: "Irregular, 5-6 hours/night"
    public string? StressLevels { get; set; } // Example: "High due to work"
    public string? CognitiveActivityPreference { get; set; } // Example: "Puzzles, reading"
    public string? LastKnownLocation { get; set; } // Example: "New York"
    public string? EmergencyContact { get; set; } // Example: "Jane Doe (Daughter) - 555-1234"
    public DateTime? LastInteractionDate { get; set; } // To track last time the bot interacted
}

public class CreateUserRequest
{
[Required]
public required string FullName { get; set; }

[Required]
public required string Password { get; set; }

[Required]
[EmailAddress]
public required string Email { get; set; }
}

public class AuthenticateUserRequest
{
[Required]
[EmailAddress]
public required string Email { get; set; }

[Required]
public required string Password { get; set; }
}

public class UpdateUserDetailsRequest
{
[Required]
public required string FullName { get; set; }

[Required]
[EmailAddress]
public required string Email { get; set; }

[Required]
public required string Password { get; set; }
}

public class AuthenticateResponse
{
public required string Message { get; set; }
public required User User { get; set; }
}