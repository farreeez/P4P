using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.Connectors.Google;
using Microsoft.Extensions.AI;
using System.ComponentModel;
using System.Text.Json;
using ChatbotBackend.Model;
using ChatbotBackend.Repositories;

public class LLMService
{
    private readonly Kernel _kernel;
    private readonly IChatCompletionService _chatService;
    private readonly IEmbeddingGenerator<string, Embedding<float>> _embeddingGenerator;
    private readonly ICalendarRepository _calendarRepository;
    private readonly IUserRepository _userRepository;
    private readonly string _apiKey;
    private readonly string _modelId;
    private readonly string _embeddingModelId;

    public LLMService(IConfiguration configuration, ICalendarRepository calendarRepository, IUserRepository userRepository)
    {
        _calendarRepository = calendarRepository;
        _userRepository = userRepository;
        _apiKey = configuration["GoogleGenerativeAI:ApiKey"];
        _modelId = configuration["GoogleGenerativeAI:ModelId"];
        _embeddingModelId = configuration["GoogleGenerativeAI:EmbeddingModelId"] ?? _modelId;

        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Google Generative AI API key is missing or incomplete.");
        }
        if (string.IsNullOrEmpty(_modelId))
        {
            throw new InvalidOperationException("Google Generative AI Model ID for chat is missing or incomplete.");
        }

        // Create kernel with calendar functions
        var kernelBuilder = Kernel.CreateBuilder()
            .AddGoogleAIGeminiChatCompletion(
                modelId: _modelId,
                apiKey: _apiKey);

        _kernel = kernelBuilder.Build();

        // Add calendar functions to the kernel
        _kernel.Plugins.AddFromObject(new CalendarFunctions(_calendarRepository, _userRepository));

        _chatService = _kernel.GetRequiredService<IChatCompletionService>();

        // Setup embedding service
        IKernelBuilder embeddingKernelBuilder = Kernel.CreateBuilder()
            .AddGoogleAIEmbeddingGenerator(
                modelId: _embeddingModelId,
                apiKey: _apiKey);
        Kernel embeddingKernel = embeddingKernelBuilder.Build();
        _embeddingGenerator = embeddingKernel.GetRequiredService<IEmbeddingGenerator<string, Embedding<float>>>();
    }

    /// <summary>
    /// Gets a response from the LLM with calendar function calling support.
    /// </summary>
    /// <param name="userMessage">The user's input message.</param>
    /// <param name="userId">The current user's ID for calendar operations.</param>
    /// <returns>The LLM's response content.</returns>
    public async Task<string> GetLLMResponseAsync(string userMessage, string userId)
    {
        var chatHistory = new ChatHistory();
        // Add system message with context about calendar capabilities
        var currentDateTime = DateTime.Now;
        chatHistory.AddSystemMessage($@"
# Combined AI Assistant System Prompt

You are a helpful AI assistant with both calendar management capabilities and brain health/dementia support features. You can help users with:

## Calendar Management Capabilities
PLEASE ONLY MENTION THAT YOU CAN HELP WITH CALENDAR CAPABILITIES ONLY IF THEY ASK FOR SOMETHING RELATED TO CALENDAR EVENTS.

1. Creating calendar events
2. Viewing their upcoming events
3. Updating existing events
4. Deleting events
5. Searching for events

**Current user ID:** {userId ?? "unknown"}

When users ask about calendar-related tasks, use the appropriate functions to help them.
Always be helpful and provide clear confirmation of actions taken.
Format dates and times in a user-friendly way.

If a user is editing or creating an event and did not mention all of the inputs, try to infer the category and description if it is easy to guess what they likely are to make a more seamless user experience.

Make sure to ask what time the event is if it is not mentioned as it is important to make sure the user chooses the time for the event.

If a user asks you to add something to their schedule, calendar, routine, or anything along those lines, assume they want you to add an event - there is no need to ask them to specify if they want you to add an event.

### For creating events, if the user doesn't specify all details:
- Default start time to the next reasonable hour
- Default duration to 1 hour if not specified
- Default category to 'Personal' if not specified
- Ask for clarification if the date/time is ambiguous

## Brain Health & Dementia Support
You can provide information, answer questions, and facilitate cognitive stimulation activities.

If the user expresses interest in playing a brain game (e.g., 'memory game', 'puzzle', 'challenge my brain'), suggest starting a specific activity. For example, you could say: 'I can help you with a memory recall activity! Say 'start memory recall activity' to begin.'

Otherwise, provide helpful and empathetic responses based on the user's query.

## Important Context
- **Current date and time:** {currentDateTime:yyyy-MM-dd HH:mm:ss} ({currentDateTime:dddd, MMMM d, yyyy})
- **Current user ID:** {userId ?? "unknown"}
- **Today is:** {currentDateTime:dddd, MMMM d, yyyy}
- **Current time:** {currentDateTime:HH:mm}

**Remember:** Today is {currentDateTime:dddd, MMMM d, yyyy} - use this for all relative dates so if they say tomorrow it is the next day etc.

## General Guidelines
- When searching or listing events, format them nicely with emojis and clear formatting
- Provide helpful and empathetic responses for brain health queries
- Be supportive and understanding when working with users who may have cognitive challenges
- Always be helpful and provide clear confirmation of actions taken
- Seamlessly transition between calendar management and brain health support based on user needs
");

        chatHistory.AddUserMessage(userMessage);

        var executionSettings = new GeminiPromptExecutionSettings
        {
            MaxTokens = 25600,
            ToolCallBehavior = GeminiToolCallBehavior.AutoInvokeKernelFunctions
        };

        try
        {
            var result = await _chatService.GetChatMessageContentAsync(
                chatHistory,
                executionSettings,
                kernel: _kernel);

            return result?.Content ?? "I apologize, but I couldn't process your request at the moment.";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting LLM response: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Gets a response from the LLM, augmented with provided context, using chat completion.
    /// This demonstrates how retrieved information would be used.
    /// </summary>
    /// <param name="userMessage">The user's input message.</param>
    /// <param name="context">Additional contextual information to provide to the LLM (e.g., retrieved documents).</param>
    /// <returns>The LLM's response content.</returns>
    public async Task<string> GetLLMResponseWithContextAsync(string userMessage, string context)
    {
        var chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage($"Here is some relevant information for your query: {context}");
        chatHistory.AddUserMessage(userMessage);

        var executionSettings = new GeminiPromptExecutionSettings
        {
            MaxTokens = 5120,
        };

        try
        {
            var result = await _chatService.GetChatMessageContentAsync(chatHistory, executionSettings);
            return result?.Content ?? string.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting LLM response with context: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Generates text embeddings using the default dimensions for the configured embedding model.
    /// </summary>
    /// <param name="text">The text for which to generate embeddings.</param>
    /// <returns>A list of Embedding<float> objects containing the generated vectors.</returns>
    public async Task<IList<Embedding<float>>> GenerateEmbeddingWithDefaultDimensionsAsync(string text)
    {
        try
        {
            var embeddings = await _embeddingGenerator.GenerateAsync([text]);
            Console.WriteLine($"Generated '{embeddings.Count}' embedding(s) with '{embeddings[0].Vector.Length}' dimensions (default) for the provided text");
            return embeddings;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating embeddings with default dimensions: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Generates text embeddings using a specified custom dimension size.
    /// Note: This method creates a new Kernel instance to apply custom dimensions.
    /// </summary>
    /// <param name="text">The text for which to generate embeddings.</param>
    /// <param name="customDimensions">The desired number of dimensions for the embedding.</param>
    /// <returns>A list of Embedding<float> objects containing the generated vectors.</returns>
    public async Task<IList<Embedding<float>>> GenerateEmbeddingWithCustomDimensionsAsync(string text, int customDimensions)
    {
        IKernelBuilder customDimKernelBuilder = Kernel.CreateBuilder();
        customDimKernelBuilder.AddGoogleAIEmbeddingGenerator(
                                    modelId: _embeddingModelId,
                                    apiKey: _apiKey,
                                    dimensions: customDimensions);
        Kernel customDimKernel = customDimKernelBuilder.Build();

        var customEmbeddingGenerator = customDimKernel.GetRequiredService<IEmbeddingGenerator<string, Embedding<float>>>();

        try
        {
            var embeddings = await customEmbeddingGenerator.GenerateAsync([text]);
            Console.WriteLine($"Generated '{embeddings.Count}' embedding(s) with '{embeddings[0].Vector.Length}' dimensions (custom: '{customDimensions}') for the provided text");
            return embeddings;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating embeddings with custom dimensions: {ex.Message}");
            throw;
        }
    }

    /// <summary>
    /// Generates an embedding for the specific "Keep your brain healthy" text.
    /// </summary>
    /// <returns>A list of Embedding<float> objects for the provided text.</returns>
    public async Task<IList<Embedding<float>>> GenerateEmbeddingForBrainHealthTextAsync()
    {
        string brainHealthText = @"
        **Understanding Dementia: A Patient's Guide**

        Dementia is a syndrome, not a single disease. It describes a group of symptoms affecting memory, thinking, and social abilities severely enough to interfere with daily life. It is caused by various diseases and conditions that damage brain cells. While memory loss is a common symptom, it's not the only one, and not all memory loss means dementia.

        **Key Facts about Dementia:**

        * **Progressive:** Most types of dementia are progressive, meaning symptoms start slowly and gradually worsen over time.
        * **Affects everyone differently:** How dementia affects a person depends on the type of dementia, the parts of the brain affected, and the individual's personality and life experiences.
        * **Not a normal part of aging:** While it's more common in older adults, dementia is not an inevitable part of aging.

        **Common Types of Dementia:**

        * **Alzheimer's Disease:** The most common cause of dementia, characterized by amyloid plaques and tau tangles in the brain.
        * **Vascular Dementia:** Caused by damage to blood vessels in the brain, often due to strokes or mini-strokes.
        * **Lewy Body Dementia:** Characterized by abnormal protein deposits (Lewy bodies) in the brain, leading to fluctuating alertness, visual hallucinations, and movement problems.
        * **Frontotemporal Dementia (FTD):** Affects the frontal and temporal lobes of the brain, impacting personality, behavior, and language.
        * **Mixed Dementia:** A combination of two or more types of dementia, most commonly Alzheimer's and vascular dementia.

        **Common Symptoms of Dementia:**

        Symptoms vary depending on the type and stage of dementia, but often include:

        * **Memory loss:** Especially difficulty remembering recent events, names, or new information.
        * **Difficulty with tasks:** Struggling with familiar tasks like cooking, managing finances, or driving.
        * **Language problems:** Trouble finding the right words, following conversations, or expressing thoughts.
        * **Disorientation:** Getting lost in familiar places or having trouble understanding time and place.
        * **Poor judgment:** Making unusual decisions or having difficulty with problem-solving.
        * **Changes in mood or personality:** Becoming irritable, anxious, withdrawn, or exhibiting unusual behaviors.
        * **Difficulty with visual and spatial abilities:** Problems judging distances, recognizing objects, or navigating.

        **Getting a Diagnosis:**

        If you or a loved one are experiencing persistent memory problems or changes in thinking, it's important to see a GP as soon as possible. A diagnosis involves:

        * **Medical history:** Discussing symptoms, health conditions, and medications.
        * **Physical and neurological examination:** To rule out other causes of symptoms.
        * **Cognitive tests:** To assess memory, thinking, and problem-solving skills.
        * **Brain scans:** Such as MRI or CT scans, to look for changes in the brain or rule out other conditions like tumors or strokes.
        * **Blood tests:** To check for deficiencies or other medical conditions that might cause similar symptoms.

        **Living Well with Dementia:**

        While there is currently no cure for most types of dementia, there are many ways to live well and manage symptoms:

        * **Medication:** Some medications can help manage symptoms, especially for Alzheimer's disease.
        * **Lifestyle choices:**
            * **Stay physically active:** Regular exercise can help maintain brain health and improve mood.
            * **Eat a balanced diet:** Rich in fruits, vegetables, whole grains, lean proteins, and healthy fats.
            * **Get enough sleep:** Aim for 7-9 hours of quality sleep per night.
            * **Stay socially connected:** Engage in conversations, join clubs, and spend time with loved ones.
            * **Challenge your brain:** Learn new skills, read, solve puzzles, and engage in hobbies.
            * **Manage stress:** Practice mindfulness, meditation, or other relaxation techniques.
            * **Limit alcohol and stop smoking:** These can negatively impact brain health.
        * **Support services:**
            * **Dementia-specific organizations:** Organizations like Alzheimers New Zealand, Alzheimer's Society (UK), and Alzheimers.gov offer information, support groups, and resources for people with dementia and their caregivers.
            * **Local support groups:** Connecting with others who understand can provide emotional support and practical advice.
            * **Occupational therapy:** To help adapt daily activities and maintain independence.
            * **Cognitive stimulation therapy (CST):** Structured activities designed to improve memory and thinking skills.

        **Supporting a Person with Dementia (for Family/Caregivers):**

        * **Communication:**
            * Use short, simple sentences.
            * Speak slowly and clearly, in a calm and reassuring tone.
            * Maintain eye contact and use gentle body language.
            * Listen patiently and allow plenty of time for responses.
            * Avoid asking too many questions or giving too many choices.
            * Focus on feelings rather than just facts.
        * **Daily Care:**
            * Establish routines to provide structure and reduce confusion.
            * Break down tasks into smaller, manageable steps.
            * Create a safe and familiar environment (e.g., remove tripping hazards, good lighting).
            * Encourage participation in activities they enjoy, adapting as needed.
        * **Understanding Changed Behavior:**
            * Remember that challenging behaviors are often a symptom of the disease, not intentional.
            * Try to identify triggers and adapt the environment or approach.
            * Respond with affection and reassurance, rather than correction.
            * Seek guidance from support organizations or healthcare professionals for specific behavioral challenges.
        * **Self-Care for Caregivers:**
            * Caring for someone with dementia can be demanding; it's crucial to look after your own well-being.
            * Seek support from family, friends, and support groups.
            * Take breaks and engage in activities you enjoy.
            * Don't hesitate to ask for help from local dementia services or healthcare providers.

        **Sources of Information:**

        * **Alzheimers.gov:** The U.S. government's portal for information on Alzheimer's disease and related dementias. (https://www.alzheimers.gov/)
        * **Alzheimer's Society (UK):** A leading charity for people affected by dementia in the UK, providing comprehensive information and support. (https://www.alzheimers.org.uk/)
        * **Alzheimers New Zealand / Dementia NZ:** National organizations providing information, support, and advocacy for people affected by dementia in New Zealand. (https://alzheimers.org.nz/ and https://dementia.nz/)

        This content is for general informational purposes and should not replace professional medical advice. Always consult with a healthcare professional for diagnosis and treatment.
        ";
        return await GenerateEmbeddingWithDefaultDimensionsAsync(brainHealthText);
    }
}

/// <summary>
/// Calendar functions that the LLM can call
/// </summary>
public class CalendarFunctions
{
    private readonly ICalendarRepository _calendarRepository;
    private readonly IUserRepository _userRepository;

    public CalendarFunctions(ICalendarRepository calendarRepository, IUserRepository userRepository)
    {
        _calendarRepository = calendarRepository;
        _userRepository = userRepository;
    }

    [KernelFunction("find_best_matching_event")]
    [Description("Finds the best matching event based on partial or misspelled event name/description")]
    public async Task<string> FindBestMatchingEvent(
        [Description("User ID")] string userId,
        [Description("Partial or potentially misspelled event name or description")] string searchText,
        [Description("Optional: date filter in YYYY-MM-DD format")] string dateFilter = null)
    {
        try
        {
            var allEvents = await _calendarRepository.GetByUserIdAsync(userId);
            var eventsList = allEvents.ToList();

            if (!eventsList.Any())
            {
                return "📅 You don't have any calendar events to search through.";
            }

            // Filter by date if provided
            if (!string.IsNullOrEmpty(dateFilter) && DateTime.TryParse(dateFilter, out DateTime filterDate))
            {
                eventsList = eventsList.Where(e => e.EventDate.Date == filterDate.Date).ToList();
                if (!eventsList.Any())
                {
                    return $"📅 No events found for {filterDate:MMMM d, yyyy}.";
                }
            }

            // Calculate similarity scores for each event
            var scoredEvents = eventsList.Select(evt => new
            {
                Event = evt,
                NameScore = CalculateSimilarity(searchText.ToLower(), evt.EventName.ToLower()),
                DescriptionScore = CalculateSimilarity(searchText.ToLower(), evt.EventDescription.ToLower()),
                // Combine scores with name weighted higher
                TotalScore = (CalculateSimilarity(searchText.ToLower(), evt.EventName.ToLower()) * 0.7) +
                           (CalculateSimilarity(searchText.ToLower(), evt.EventDescription.ToLower()) * 0.3)
            }).OrderByDescending(x => x.TotalScore).ToList();

            var bestMatch = scoredEvents.First();

            // Set threshold for "good enough" match
            const double threshold = 0.3;

            if (bestMatch.TotalScore < threshold)
            {
                // No good match found, show all events for user to choose
                var response = $"🔍 No close match found for '{searchText}'. Here are your available events:\n\n";
                foreach (var evt in eventsList.OrderBy(e => e.StartTime))
                {
                    response += $"• **{evt.EventName}** (ID: {evt.Id})\n";
                    response += $"  📅 {evt.EventDate:MMMM d, yyyy}\n";
                    response += $"  🕐 {evt.StartTime:h:mm tt} - {evt.EndTime:h:mm tt}\n\n";
                }
                return response;
            }

            // Show the best match and ask for confirmation
            var matchedEvent = bestMatch.Event;
            var confidence = (bestMatch.TotalScore * 100).ToString("F0");

            return $@"🎯 Best match found ({confidence}% confidence):

• **{matchedEvent.EventName}** (ID: {matchedEvent.Id})
  📅 {matchedEvent.EventDate:MMMM d, yyyy}
  🕐 {matchedEvent.StartTime:h:mm tt} - {matchedEvent.EndTime:h:mm tt}
  📝 {matchedEvent.EventDescription}
  🏷️ Category: {matchedEvent.Category}

Is this the event you want to modify? If so, I can help you update or delete it.";
        }
        catch (Exception ex)
        {
            return $"❌ Error finding matching event: {ex.Message}";
        }
    }

    [KernelFunction("smart_update_event")]
    [Description("Updates an event by finding the best match for a partial/misspelled name, then updating it")]
    public async Task<string> SmartUpdateEvent(
        [Description("User ID")] string userId,
        [Description("Partial or potentially misspelled event name to find")] string searchText,
        [Description("New name/title of the event (optional)")] string newEventName = null,
        [Description("New description of the event (optional)")] string newEventDescription = null,
        [Description("New date of the event in ISO format (optional)")] string newEventDate = null,
        [Description("New start time in ISO format (optional)")] string newStartTime = null,
        [Description("New end time in ISO format (optional)")] string newEndTime = null,
        [Description("New category (optional)")] string newCategory = null)
    {
        try
        {
            var allEvents = await _calendarRepository.GetByUserIdAsync(userId);
            var eventsList = allEvents.ToList();

            if (!eventsList.Any())
            {
                return "📅 You don't have any calendar events to update.";
            }

            // Find best matching event
            var scoredEvents = eventsList.Select(evt => new
            {
                Event = evt,
                TotalScore = (CalculateSimilarity(searchText.ToLower(), evt.EventName.ToLower()) * 0.7) +
                           (CalculateSimilarity(searchText.ToLower(), evt.EventDescription.ToLower()) * 0.3)
            }).OrderByDescending(x => x.TotalScore).ToList();

            var bestMatch = scoredEvents.First();
            const double threshold = 0.3;

            if (bestMatch.TotalScore < threshold)
            {
                return $"❌ Could not find a good match for '{searchText}'. Please use 'find_best_matching_event' first to see available events.";
            }

            var eventToUpdate = bestMatch.Event;

            // Update only the provided fields, keep existing values for others
            var updatedEvent = new Calendar
            {
                Id = eventToUpdate.Id,
                EventName = newEventName ?? eventToUpdate.EventName,
                EventDescription = newEventDescription ?? eventToUpdate.EventDescription,
                EventDate = !string.IsNullOrEmpty(newEventDate) ? DateTime.Parse(newEventDate) : eventToUpdate.EventDate,
                StartTime = !string.IsNullOrEmpty(newStartTime) ? DateTime.Parse(newStartTime) : eventToUpdate.StartTime,
                EndTime = !string.IsNullOrEmpty(newEndTime) ? DateTime.Parse(newEndTime) : eventToUpdate.EndTime,
                Category = newCategory ?? eventToUpdate.Category,
                UserId = eventToUpdate.UserId
            };

            await _calendarRepository.UpdateAsync(updatedEvent);

            return $"✅ Successfully updated event '{updatedEvent.EventName}' (was: '{eventToUpdate.EventName}') on {updatedEvent.EventDate:MMMM d, yyyy}.";
        }
        catch (Exception ex)
        {
            return $"❌ Error updating event: {ex.Message}";
        }
    }

    [KernelFunction("smart_delete_event")]
    [Description("Deletes an event by finding the best match for a partial/misspelled name")]
    public async Task<string> SmartDeleteEvent(
        [Description("User ID")] string userId,
        [Description("Partial or potentially misspelled event name to find and delete")] string searchText,
        [Description("Optional: date filter to narrow search")] string dateFilter = null)
    {
        try
        {
            var allEvents = await _calendarRepository.GetByUserIdAsync(userId);
            var eventsList = allEvents.ToList();

            if (!eventsList.Any())
            {
                return "📅 You don't have any calendar events to delete.";
            }

            // Filter by date if provided
            if (!string.IsNullOrEmpty(dateFilter) && DateTime.TryParse(dateFilter, out DateTime filterDate))
            {
                eventsList = eventsList.Where(e => e.EventDate.Date == filterDate.Date).ToList();
            }

            // Find best matching event
            var scoredEvents = eventsList.Select(evt => new
            {
                Event = evt,
                TotalScore = (CalculateSimilarity(searchText.ToLower(), evt.EventName.ToLower()) * 0.7) +
                           (CalculateSimilarity(searchText.ToLower(), evt.EventDescription.ToLower()) * 0.3)
            }).OrderByDescending(x => x.TotalScore).ToList();

            var bestMatch = scoredEvents.First();
            const double threshold = 0.3;

            if (bestMatch.TotalScore < threshold)
            {
                return $"❌ Could not find a good match for '{searchText}'. Please use 'find_best_matching_event' first to see available events.";
            }

            var eventToDelete = bestMatch.Event;
            var eventName = eventToDelete.EventName;
            var deleted = await _calendarRepository.DeleteAsync(eventToDelete.Id);

            if (!deleted)
            {
                return "❌ Failed to delete event.";
            }

            // Remove from user's calendar items
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                user.CalendarItems.Remove(eventToDelete.Id);
                await _userRepository.UpdateAsync(user);
            }

            return $"✅ Successfully deleted event '{eventName}'.";
        }
        catch (Exception ex)
        {
            return $"❌ Error deleting event: {ex.Message}";
        }
    }

    /// <summary>
    /// Calculates similarity between two strings using a combination of techniques
    /// </summary>
    private double CalculateSimilarity(string source, string target)
    {
        if (string.IsNullOrEmpty(source) || string.IsNullOrEmpty(target))
            return 0;

        if (source == target)
            return 1;

        // Check for exact substring match
        if (source.Contains(target) || target.Contains(source))
            return 0.8;

        // Levenshtein distance similarity
        var levenshteinSimilarity = 1.0 - (double)LevenshteinDistance(source, target) / Math.Max(source.Length, target.Length);

        // Jaccard similarity (word-based)
        var jaccardSimilarity = CalculateJaccardSimilarity(source, target);

        // Combine both metrics
        return (levenshteinSimilarity * 0.6) + (jaccardSimilarity * 0.4);
    }

    /// <summary>
    /// Calculates Levenshtein distance between two strings
    /// </summary>
    private int LevenshteinDistance(string source, string target)
    {
        if (source == null) return target?.Length ?? 0;
        if (target == null) return source.Length;

        var matrix = new int[source.Length + 1, target.Length + 1];

        // Initialize first column and row
        for (int i = 0; i <= source.Length; i++)
            matrix[i, 0] = i;
        for (int j = 0; j <= target.Length; j++)
            matrix[0, j] = j;

        // Fill the matrix
        for (int i = 1; i <= source.Length; i++)
        {
            for (int j = 1; j <= target.Length; j++)
            {
                int cost = (target[j - 1] == source[i - 1]) ? 0 : 1;
                matrix[i, j] = Math.Min(
                    Math.Min(matrix[i - 1, j] + 1, matrix[i, j - 1] + 1),
                    matrix[i - 1, j - 1] + cost);
            }
        }

        return matrix[source.Length, target.Length];
    }

    /// <summary>
    /// Calculates Jaccard similarity between two strings based on word overlap
    /// </summary>
    private double CalculateJaccardSimilarity(string source, string target)
    {
        var sourceWords = source.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
        var targetWords = target.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet();

        var intersection = sourceWords.Intersect(targetWords).Count();
        var union = sourceWords.Union(targetWords).Count();

        return union == 0 ? 0 : (double)intersection / union;
    }

    // ... Keep all your existing functions (create_calendar_event, get_user_events, etc.)

    [KernelFunction("create_calendar_event")]
    [Description("Creates a new calendar event for the user")]
    public async Task<string> CreateCalendarEvent(
        [Description("Name/title of the event")] string eventName,
        [Description("Description of the event")] string eventDescription,
        [Description("Date of the event in ISO format (YYYY-MM-DD)")] string eventDate,
        [Description("Start time in ISO format (YYYY-MM-DDTHH:mm:ss)")] string startTime,
        [Description("End time in ISO format (YYYY-MM-DDTHH:mm:ss)")] string endTime,
        [Description("Category: Work, Personal, Family, Social, Health, or Other")] string category,
        [Description("User ID")] string userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return "Error: User not found.";
            }

            var newEvent = new Calendar
            {
                EventName = eventName,
                EventDescription = eventDescription,
                EventDate = DateTime.Parse(eventDate),
                StartTime = DateTime.Parse(startTime),
                EndTime = DateTime.Parse(endTime),
                Category = category,
                UserId = userId
            };

            var createdEvent = await _calendarRepository.CreateAsync(newEvent);
            user.CalendarItems.Add(createdEvent.Id!);
            await _userRepository.UpdateAsync(user);

            return $"✅ Successfully created event '{eventName}' on {DateTime.Parse(eventDate):MMMM d, yyyy} from {DateTime.Parse(startTime):h:mm tt} to {DateTime.Parse(endTime):h:mm tt}.";
        }
        catch (Exception ex)
        {
            return $"❌ Error creating event: {ex.Message}";
        }
    }

    [KernelFunction("get_user_events")]
    [Description("Gets all calendar events for a user")]
    public async Task<string> GetUserEvents([Description("User ID")] string userId)
    {
        try
        {
            var events = await _calendarRepository.GetByUserIdAsync(userId);
            var eventsList = events.ToList();

            if (!eventsList.Any())
            {
                return "📅 You don't have any calendar events scheduled.";
            }

            var response = "📅 Your upcoming events:\n\n";
            foreach (var evt in eventsList.OrderBy(e => e.StartTime))
            {
                response += $"• **{evt.EventName}** ({evt.Category}) [ID: {evt.Id}]\n";
                response += $"  📅 {evt.EventDate:MMMM d, yyyy}\n";
                response += $"  🕐 {evt.StartTime:h:mm tt} - {evt.EndTime:h:mm tt}\n";
                response += $"  📝 {evt.EventDescription}\n\n";
            }

            return response;
        }
        catch (Exception ex)
        {
            return $"❌ Error retrieving events: {ex.Message}";
        }
    }

    [KernelFunction("get_upcoming_events")]
    [Description("Gets upcoming/unfinished calendar events for a user")]
    public async Task<string> GetUpcomingEvents([Description("User ID")] string userId)
    {
        try
        {
            var events = await _calendarRepository.GetUnfinishedEventsByUserIdAsync(userId);
            var eventsList = events.ToList();

            if (!eventsList.Any())
            {
                return "📅 You don't have any upcoming events.";
            }

            var response = "📅 Your upcoming events:\n\n";
            foreach (var evt in eventsList.OrderBy(e => e.StartTime).Take(5))
            {
                response += $"• **{evt.EventName}** ({evt.Category}) [ID: {evt.Id}]\n";
                response += $"  📅 {evt.EventDate:MMMM d, yyyy}\n";
                response += $"  🕐 {evt.StartTime:h:mm tt} - {evt.EndTime:h:mm tt}\n";
                response += $"  📝 {evt.EventDescription}\n\n";
            }

            return response;
        }
        catch (Exception ex)
        {
            return $"❌ Error retrieving upcoming events: {ex.Message}";
        }
    }

    [KernelFunction("update_calendar_event")]
    [Description("Updates an existing calendar event")]
    public async Task<string> UpdateCalendarEvent(
        [Description("Event ID to update")] string eventId,
        [Description("New name/title of the event")] string eventName,
        [Description("New description of the event")] string eventDescription,
        [Description("New date of the event in ISO format (YYYY-MM-DD)")] string eventDate,
        [Description("New start time in ISO format (YYYY-MM-DDTHH:mm:ss)")] string startTime,
        [Description("New end time in ISO format (YYYY-MM-DDTHH:mm:ss)")] string endTime,
        [Description("New category: Work, Personal, Family, Social, Health, or Other")] string category)
    {
        try
        {
            var existingEvent = await _calendarRepository.GetByIdAsync(eventId);
            if (existingEvent == null)
            {
                return "❌ Event not found.";
            }

            existingEvent.EventName = eventName;
            existingEvent.EventDescription = eventDescription;
            existingEvent.EventDate = DateTime.Parse(eventDate);
            existingEvent.StartTime = DateTime.Parse(startTime);
            existingEvent.EndTime = DateTime.Parse(endTime);
            existingEvent.Category = category;

            await _calendarRepository.UpdateAsync(existingEvent);

            return $"✅ Successfully updated event '{eventName}' for {DateTime.Parse(eventDate):MMMM d, yyyy}.";
        }
        catch (Exception ex)
        {
            return $"❌ Error updating event: {ex.Message}";
        }
    }

    [KernelFunction("delete_calendar_event")]
    [Description("Deletes a calendar event")]
    public async Task<string> DeleteCalendarEvent(
        [Description("Event ID to delete")] string eventId,
        [Description("User ID")] string userId)
    {
        try
        {
            var existingEvent = await _calendarRepository.GetByIdAsync(eventId);
            if (existingEvent == null)
            {
                return "❌ Event not found.";
            }

            var eventName = existingEvent.EventName;
            var deleted = await _calendarRepository.DeleteAsync(eventId);

            if (!deleted)
            {
                return "❌ Failed to delete event.";
            }

            // Remove from user's calendar items
            var user = await _userRepository.GetByIdAsync(userId);
            if (user != null)
            {
                user.CalendarItems.Remove(eventId);
                await _userRepository.UpdateAsync(user);
            }

            return $"✅ Successfully deleted event '{eventName}'.";
        }
        catch (Exception ex)
        {
            return $"❌ Error deleting event: {ex.Message}";
        }
    }

    [KernelFunction("search_events")]
    [Description("Searches for calendar events by name or description")]
    public async Task<string> SearchEvents(
        [Description("User ID")] string userId,
        [Description("Search term to look for in event names or descriptions")] string searchTerm)
    {
        try
        {
            var allEvents = await _calendarRepository.GetByUserIdAsync(userId);
            var matchingEvents = allEvents.Where(e =>
                e.EventName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) ||
                e.EventDescription.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
            ).ToList();

            if (!matchingEvents.Any())
            {
                return $"🔍 No events found matching '{searchTerm}'.";
            }

            var response = $"🔍 Found {matchingEvents.Count} event(s) matching '{searchTerm}':\n\n";
            foreach (var evt in matchingEvents.OrderBy(e => e.StartTime))
            {
                response += $"• **{evt.EventName}** (ID: {evt.Id})\n";
                response += $"  📅 {evt.EventDate:MMMM d, yyyy}\n";
                response += $"  🕐 {evt.StartTime:h:mm tt} - {evt.EndTime:h:mm tt}\n";
                response += $"  📝 {evt.EventDescription}\n\n";
            }

            return response;
        }
        catch (Exception ex)
        {
            return $"❌ Error searching events: {ex.Message}";
        }
    }
}