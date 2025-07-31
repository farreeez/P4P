// UserMemory.cs - New EF Core models for storing user information
using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Model
{
    /// <summary>
    /// Stores individual facts/preferences about users
    /// </summary>
    public class UserFact
    {
        public string? Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        [Required]
        public required string Category { get; set; } // "personal", "health", "preferences", "goals", "family"

        [Required]
        public required string Key { get; set; } // "age", "condition", "exercise_preference"

        [Required]
        public required string Value { get; set; } // "65", "mild_anxiety", "yoga"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public int Confidence { get; set; } = 100; // 0-100, how confident we are in this fact
    }

    /// <summary>
    /// Stores structured health information
    /// </summary>
    public class UserHealthProfile
    {
        public string? Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        public int? Age { get; set; }
        public string? MedicalConditions { get; set; } // JSON array of conditions
        public string? Medications { get; set; } // JSON array of medications
        public string? Allergies { get; set; } // JSON array of allergies
        public string? ExerciseHabits { get; set; } // JSON object with exercise info
        public string? DietaryPreferences { get; set; } // JSON object with diet info
        public string? SleepPatterns { get; set; } // JSON object with sleep info
        public string? CognitiveBaseline { get; set; } // JSON object with baseline cognitive scores

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Stores conversation summaries to prevent context bloat
    /// </summary>
    public class ConversationSummary
    {
        public string? Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        [Required]
        public required string Summary { get; set; }

        public DateTime ConversationDate { get; set; }
        public int MessageCount { get; set; }
        public string? KeyTopics { get; set; } // JSON array of main topics discussed
        public string? ExtractedFacts { get; set; } // JSON array of facts learned in this conversation

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Stores user goals and progress tracking
    /// </summary>
    public class UserGoal
    {
        public string? Id { get; set; }

        [Required]
        public required string UserId { get; set; }

        [Required]
        public required string GoalType { get; set; } // "cognitive", "physical", "social", "medical"

        [Required]
        public required string Description { get; set; }

        public string? TargetValue { get; set; }
        public string? CurrentProgress { get; set; }
        public DateTime? TargetDate { get; set; }
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}