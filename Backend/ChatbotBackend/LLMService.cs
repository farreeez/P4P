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
            MaxTokens = 512, 
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
        //string brainHealthText = @"
        //    Keep your brain healthy

        //    A healthy brain helps you live a full life, whatever your age. It lets you think, feel, learn, work and play.

        //    There are simple things you can do every day to protect your brain health. Some of these things are also good for your physical and mental health.

        //    Move more
        //    Being physically active is one of the best things you can do for your brain. Aim for 30 minutes of moderate-intensity activity, most days of the week. This could be a brisk walk, swimming, cycling or dancing. Try to include activities that get your heart rate up and make you a little breathless. Exercise increases blood flow to the brain, which helps deliver oxygen and nutrients.

        //    Eat well
        //    A balanced diet rich in fruits, vegetables, whole grains, lean proteins and healthy fats (like those found in olive oil and avocados) supports brain health. Foods high in antioxidants and omega-3 fatty acids are particularly beneficial. Limit processed foods, sugary drinks and excessive saturated fats.

        //    Sleep well
        //    Quality sleep is crucial for brain health. During sleep, your brain processes information, consolidates memories and clears out waste products. Aim for 7–9 hours of sleep per night. Establish a regular sleep schedule, create a relaxing bedtime routine and ensure your sleep environment is dark, quiet and cool.

        //    Stay connected
        //    Social interaction and maintaining strong relationships can help keep your brain active and reduce the risk of cognitive decline. Engage in conversations, join clubs, volunteer or spend time with family and friends. Loneliness and isolation can negatively impact brain health.

        //    Challenge your brain
        //    Keep your mind active by learning new skills, solving puzzles, reading books, playing strategy games or taking up a new hobby. This creates new neural pathways and strengthens existing ones, improving cognitive reserve.

        //    Manage stress
        //    Chronic stress can have detrimental effects on brain health. Practice stress-reducing techniques such as mindfulness, meditation, yoga or deep breathing exercises. Spend time in nature, listen to music or engage in hobbies you enjoy.

        //    Limit alcohol
        //    Excessive alcohol consumption can damage brain cells and impair cognitive function. If you drink alcohol, do so in moderation.

        //    Stop smoking
        //    Smoking significantly increases the risk of stroke, dementia and other brain health problems. Quitting smoking is one of the best things you can do for your overall health, including your brain.

        //    Protect your head
        //    Wear helmets during sports or activities that pose a risk of head injury. Prevent falls, especially as you get older, by keeping your home clear of hazards and using assistive devices if needed. Head injuries, even mild ones, can contribute to long-term cognitive issues.

        //    Regular health checks
        //    Work with your doctor to manage chronic conditions like high blood pressure, diabetes and high cholesterol. These conditions can impact brain health if left uncontrolled. Regular check-ups allow for early detection and management of potential issues.
        //";

        string brainHealthText = @"
Welcome, aspiring fashionistas, to **MangoonFashion**! This isn't your grandma's runway show. This is a game of spontaneous, nonsensical style, where arbitrary fruit-based measurements and unexpected avian interference dictate your sartorial destiny. Forget about trends; embrace the utterly absurd!

## The Core Gameplay Loop: A Fruity Fashion Frenzy

The goal of MangoonFashion is to create the most **""Mangoon-tastic""** outfit within highly restrictive and ever-changing parameters. Players compete in rounds, each focusing on a specific item of clothing or a bizarre theme.

1.  **The Grand Reveal:** At the start of each round, the **Supreme Mango Maven** (that's you, the designated judge, or a rotating role) announces the garment category (e.g., ""Hats!"", ""Shoes!"", ""Something for your left elbow!"").
2.  **The Mango Measurement Mandate:** This is where things get truly wild. Before anyone touches fabric, the Supreme Mango Maven places a **fresh, ripe mango** on a measuring tape. The exact *length* of the mango (from stem to tip, in centimeters) becomes the **mandatory length or width** for a key part of the garment being designed. If the mango rolls off, you must use a new mango and restart the measurement! No measuring until the mango is stable!
3.  **The Ten-Minute Tailor Tantrum:** Players have *exactly* ten minutes to assemble or create an outfit piece that adheres to the Mango Measurement Mandate. You can use anything available to you: clothes from your wardrobe, recycled materials, kitchen towels, anything! Creativity within chaos is key.
4.  **The Runway of Ridiculousness:** Once the time is up, each player presents their creation. The Supreme Mango Maven scrutinizes each piece not for traditional beauty, but for **""Mangoon-ity""** (how well it incorporates the mango measurement, how absurd it is, and its overall ability to confuse onlookers).

## The Stupid Rules of MangoonFashion

Prepare yourself, for these rules are as arbitrary as they are essential to the game's integrity.

* **Rule of the Rolling Render:** If your chosen mango rolls off the measuring tape *more than three times* during the measurement phase, you must use a **banana** for the measurement instead. The banana's length dictates the width, and its *curve* dictates the required *degree of curvature* in your garment.
* **The ""Fashion Faux Pas"" Penalty:** If any player is caught taking a selfie with their garment *before* the official judging, they must wear a **tin foil hat** for the remainder of the game. If they already have a tin foil hat, they must wear *two*.
* **The Banana Peel Challenge:** Midway through *any* round, the Supreme Mango Maven may suddenly declare a ""Banana Peel Challenge!"" All players must then **hop on one leg** while completing their garment for the next 30 seconds. If they lose balance, they must restart their current garment (even if it means starting from scratch).
* **The Sudden Style Shift:** At random intervals, signaled by the Maven shouting ""SQUID INK!"", all players must immediately incorporate something **black and shiny** into their current garment, regardless of the previous theme or measurement. Failure to do so results in a penalty: you must wear your socks on your hands for the next round.
* **The Unspoken Rule of the Sock Puppet:** Every participant, without exception, must have a **sock puppet** accompanying them. This puppet does not participate in the fashion, but it must be addressed respectfully and offered fashion advice at least once per round. If the puppet is ignored, it incurs a penalty: the player must wear their garment *inside out* for the next.
";
        return await GenerateEmbeddingWithDefaultDimensionsAsync(brainHealthText);
    }
}