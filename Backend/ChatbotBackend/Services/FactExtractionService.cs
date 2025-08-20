using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.Extensions.Configuration;
using ChatbotBackend.Model;
using ChatbotBackend.Repositories;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.SemanticKernel.Connectors.Google;

namespace ChatbotBackend.Services
{
    public class FactExtractionService
    {
        private readonly Kernel _kernel;
        private readonly IChatCompletionService _chatCompletionService;
        private readonly IUserRepository _userRepository;
        private readonly string _modelId;
        private readonly string _apiKey;

        public FactExtractionService(IConfiguration configuration, IUserRepository userRepository)
        {
            _userRepository = userRepository;
            _apiKey = configuration["GoogleGenerativeAI:ApiKey"];
            _modelId = configuration["GoogleGenerativeAI:ModelId"];

            // Create a separate kernel instance for fact extraction if desired,
            // or reuse the main LLMService's kernel if dependencies allow.
            // For simplicity, we'll create one here.
            _kernel = Kernel.CreateBuilder()
                .AddGoogleAIGeminiChatCompletion(modelId: _modelId, apiKey: _apiKey)
                .Build();
            _chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();
        }

        public async Task ExtractAndStoreFactsAsync(string userId, string userMessage)
        {
            if (string.IsNullOrWhiteSpace(userMessage))
            {
                return;
            }

            // Create a temporary ChatHistory for this specific task
            var chatHistory = new ChatHistory();
            chatHistory.AddSystemMessage($@"
You are a fact extraction assistant. Your task is to analyze user messages and extract structured facts about them.
Identify facts related to their personal details, health, preferences, and lifestyle.
Only extract facts that are explicitly mentioned and concrete. Do not infer or invent information.

Output the extracted facts as a JSON object with keys corresponding to the UserProfile properties.
If a fact is numerical (like age or date), try to parse it into the correct type if possible (e.g., DateOfBirth as YYYY-MM-DD).
If no new facts are found, respond with an empty JSON object {{}}.

Example User Input: ""I'm John, 45 years old, and my mother had Alzheimer's. I also try to walk every day.""
Example Output: {{ ""FullName"": ""John"", ""DateOfBirth"": ""1979-01-01"", ""FamilyHistoryDementia"": ""Mother had Alzheimer's"", ""LifestyleHabits"": ""Walks every day"" }}

Example User Input: ""I prefer direct communication and I take Vitamin D.""
Example Output: {{ ""PreferredCommunicationStyle"": ""Direct"", ""CurrentMedications"": ""Vitamin D"" }}

User's message: ""{userMessage}""
");
            chatHistory.AddUserMessage(userMessage);

            var executionSettings = new GeminiPromptExecutionSettings
            {
                MaxTokens = 500, // Keep this small as we expect a structured JSON output
                Temperature = 0.0f, // Make the output deterministic
            };

            try
            {
                var result = await _chatCompletionService.GetChatMessageContentAsync(
                    chatHistory, // Pass the temporary chat history
                    executionSettings,
                    kernel: _kernel);

                var jsonResponse = result?.Content;

                if (!string.IsNullOrWhiteSpace(jsonResponse) && jsonResponse != "{}")
                {
                    // Clean up potential markdown formatting (e.g., ```json...```)
                    jsonResponse = jsonResponse.Trim().TrimStart('`').TrimEnd('`');
                    if (jsonResponse.StartsWith("json\n"))
                    {
                        jsonResponse = jsonResponse.Substring(5).Trim();
                    }

                    // Deserialize the JSON into a dictionary or dynamic object
                    var extractedFacts = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(jsonResponse);

                    if (extractedFacts != null && extractedFacts.Any())
                    {
                        var userToUpdate = await _userRepository.GetByIdAsync(userId);
                        if (userToUpdate == null)
                        {
                            // If user not found, perhaps create a basic one or log an error
                            Console.WriteLine($"FactExtractionService: User {userId} not found for fact update.");
                            return;
                        }

                        // Update user properties based on extracted facts
                        // Use reflection for a more generic approach, or direct mapping for clarity
                        // For simplicity and safety, direct mapping is shown for key fields.
                        // For a more robust solution, consider a library like AutoMapper or
                        // a more advanced reflection-based updater.

                        // Example direct mapping:
                        if (extractedFacts.TryGetValue("FullName", out var fullNameElement) && fullNameElement.ValueKind == JsonValueKind.String)
                            userToUpdate.FullName = fullNameElement.GetString();
                        if (extractedFacts.TryGetValue("DateOfBirth", out var dobElement) && dobElement.ValueKind == JsonValueKind.String && DateTime.TryParse(dobElement.GetString(), out var dob))
                            userToUpdate.DateOfBirth = dob;
                        if (extractedFacts.TryGetValue("Gender", out var genderElement) && genderElement.ValueKind == JsonValueKind.String)
                            userToUpdate.Gender = genderElement.GetString();
                        if (extractedFacts.TryGetValue("FamilyHistoryDementia", out var fhdElement) && fhdElement.ValueKind == JsonValueKind.String)
                            userToUpdate.FamilyHistoryDementia = fhdElement.GetString();
                        if (extractedFacts.TryGetValue("LifestyleHabits", out var lhElement) && lhElement.ValueKind == JsonValueKind.String)
                            userToUpdate.LifestyleHabits = lhElement.GetString();
                        if (extractedFacts.TryGetValue("MedicalConditions", out var mcElement) && mcElement.ValueKind == JsonValueKind.String)
                            userToUpdate.MedicalConditions = mcElement.GetString();
                        if (extractedFacts.TryGetValue("PrimaryBrainHealthConcern", out var pbhcElement) && pbhcElement.ValueKind == JsonValueKind.String)
                            userToUpdate.PrimaryBrainHealthConcern = pbhcElement.GetString();
                        if (extractedFacts.TryGetValue("PreferredCommunicationStyle", out var pcsElement) && pcsElement.ValueKind == JsonValueKind.String)
                            userToUpdate.PreferredCommunicationStyle = pcsElement.GetString();
                        if (extractedFacts.TryGetValue("CurrentMedications", out var cmElement) && cmElement.ValueKind == JsonValueKind.String)
                            userToUpdate.CurrentMedications = cmElement.GetString();
                        if (extractedFacts.TryGetValue("SleepPatterns", out var spElement) && spElement.ValueKind == JsonValueKind.String)
                            userToUpdate.SleepPatterns = spElement.GetString();
                        if (extractedFacts.TryGetValue("StressLevels", out var slElement) && slElement.ValueKind == JsonValueKind.String)
                            userToUpdate.StressLevels = slElement.GetString();
                        if (extractedFacts.TryGetValue("CognitiveActivityPreference", out var capElement) && capElement.ValueKind == JsonValueKind.String)
                            userToUpdate.CognitiveActivityPreference = capElement.GetString();
                        if (extractedFacts.TryGetValue("LastKnownLocation", out var lklElement) && lklElement.ValueKind == JsonValueKind.String)
                            userToUpdate.LastKnownLocation = lklElement.GetString();
                        if (extractedFacts.TryGetValue("EmergencyContact", out var ecElement) && ecElement.ValueKind == JsonValueKind.String)
                            userToUpdate.EmergencyContact = ecElement.GetString();

                        // Update LastInteractionDate every time a fact is extracted or updated
                        userToUpdate.LastInteractionDate = DateTime.UtcNow;

                        await _userRepository.UpdateAsync(userToUpdate);
                        Console.WriteLine($"FactExtractionService: User {userId} profile updated with facts: {jsonResponse}");
                    }
                }
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"FactExtractionService: Could not parse LLM response as JSON. Error: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"FactExtractionService: Error extracting or storing facts: {ex.Message}");
            }
        }
    }
}