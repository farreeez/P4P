public enum AssessmentQuestionType
{
    Standard, // Regular chat message
    SimpleAssessment, // Question 1: Day of week - read aloud, stays visible, text/verbal response
    MemoryRecall, // Question 2: Three words - read aloud, hidden after 3s, text/verbal response
    VerbalOnly, // Question 3: Count backwards - read aloud, stays visible, verbal response only
    TimedVerbal // Question 4: Animals naming - read aloud, stays visible, verbal response with 30s timer
}
