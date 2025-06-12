using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.Connectors.Google;
using Microsoft.Extensions.AI;

public class LLMService
{
    private readonly IChatCompletionService _chatService;
    private readonly IEmbeddingGenerator<string, Embedding<float>> _embeddingGenerator;
    private readonly string _apiKey;
    private readonly string _modelId;
    private readonly string _embeddingModelId;

    public LLMService(IConfiguration configuration)
    {
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
        if (string.IsNullOrEmpty(_embeddingModelId))
        {
            throw new InvalidOperationException("Google Generative AI Embedding Model ID is missing or incomplete.");
        }

        IKernelBuilder chatKernelBuilder = Kernel.CreateBuilder()
                                                  .AddGoogleAIGeminiChatCompletion(
                                                      modelId: _modelId,
                                                      apiKey: _apiKey);
        Kernel chatKernel = chatKernelBuilder.Build();
        _chatService = chatKernel.GetRequiredService<IChatCompletionService>();

        IKernelBuilder embeddingKernelBuilder = Kernel.CreateBuilder()
                                                      .AddGoogleAIEmbeddingGenerator(
                                                          modelId: _embeddingModelId,
                                                          apiKey: _apiKey);
        Kernel embeddingKernel = embeddingKernelBuilder.Build();
        _embeddingGenerator = embeddingKernel.GetRequiredService<IEmbeddingGenerator<string, Embedding<float>>>();
    }

    /// <summary>
    /// Gets a response from the LLM based on user message using chat completion.
    /// </summary>
    /// <param name="userMessage">The user's input message.</param>
    /// <returns>The LLM's response content.</returns>
    public async Task<string> GetLLMResponseAsync(string userMessage)
    {
        var chatHistory = new ChatHistory();
        chatHistory.AddUserMessage(userMessage);

        var executionSettings = new GeminiPromptExecutionSettings
        {
            MaxTokens = 25600,
            // Temperature = 0.7,
            // TopP = 0.9,
            // TopK = 40,
            // ThinkingConfig = new() { ThinkingBudget = 2000 }
        };

        try
        {
            var result = await _chatService.GetChatMessageContentAsync(chatHistory, executionSettings);

            if (result == null)
            {
                return string.Empty;
            }

            return result?.Content;
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

            if (result == null)
            {
                return string.Empty;
            }

            return result?.Content;
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