using Google.Cloud.Speech.V1;
using Google.Protobuf;

public class SpeechToTextService
{
    private readonly SpeechClient _client;
    private readonly ILogger<SpeechToTextService> _logger;

    public SpeechToTextService(ILogger<SpeechToTextService> logger, IConfiguration configuration)
    {
        _logger = logger;

        try
        {
            // Set environment variable for Google Cloud credentials
            var keyFilePath = configuration["GoogleCloud:KeyFilePath"];

            if (!string.IsNullOrEmpty(keyFilePath))
            {
                if (!File.Exists(keyFilePath))
                {
                    throw new FileNotFoundException($"Google Cloud service account key file not found at: {keyFilePath}");
                }

                // Set the environment variable that Google Cloud libraries expect
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", keyFilePath);
                _logger.LogInformation("Set GOOGLE_APPLICATION_CREDENTIALS to: {KeyFilePath}", keyFilePath);
            }

            // Create the client - it will automatically use the credentials from the environment variable
            _client = SpeechClient.Create();
            _logger.LogInformation("Successfully initialized Google Cloud Speech-to-Text client");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize Google Cloud Speech-to-Text client");
            throw new InvalidOperationException("Failed to initialize Google Cloud Speech-to-Text client. Please check your credentials configuration.", ex);
        }
    }

    public async Task<string> ConvertSpeechToTextAsync(
byte[] audioBytes,
string languageCode = "en-US",
int sampleRateHertz = 16000,
RecognitionConfig.Types.AudioEncoding audioEncoding = RecognitionConfig.Types.AudioEncoding.Mp3,
bool enableAutomaticPunctuation = true)
    {
        try
        {
            var config = new RecognitionConfig
            {
                Encoding = audioEncoding,
                LanguageCode = languageCode,
                EnableAutomaticPunctuation = enableAutomaticPunctuation
            };

            // Only set sample rate for formats that require it
            // For WEBM_OPUS and other compressed formats, let Google Cloud auto-detect
            if (audioEncoding == RecognitionConfig.Types.AudioEncoding.Linear16 ||
                audioEncoding == RecognitionConfig.Types.AudioEncoding.Mulaw)
            {
                config.SampleRateHertz = sampleRateHertz;
            }
            // Don't set sample rate for: MP3, FLAC, WEBM_OPUS, OGG_OPUS, AMR, AMR_WB

            var audio = new RecognitionAudio
            {
                Content = ByteString.CopyFrom(audioBytes)
            };

            var response = await _client.RecognizeAsync(config, audio);

            var transcription = string.Join(" ", response.Results
                .SelectMany(result => result.Alternatives)
                .Select(alternative => alternative.Transcript));

            _logger.LogInformation("Successfully transcribed audio. Text length: {Length} characters", transcription.Length);

            return transcription;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting speech to text");
            throw;
        }
    }

    public async Task<SpeechRecognitionResult> ConvertSpeechToTextDetailedAsync(
        byte[] audioBytes,
        string languageCode = "en-US",
        int sampleRateHertz = 16000,
        RecognitionConfig.Types.AudioEncoding audioEncoding = RecognitionConfig.Types.AudioEncoding.Mp3,
        int maxAlternatives = 3)
    {
        try
        {
            var config = new RecognitionConfig
            {
                Encoding = audioEncoding,
                LanguageCode = languageCode,
                MaxAlternatives = maxAlternatives,
                EnableAutomaticPunctuation = true,
                EnableWordTimeOffsets = true,
                EnableWordConfidence = true
            };

            // Only set sample rate for formats that require it
            if (audioEncoding == RecognitionConfig.Types.AudioEncoding.Linear16 ||
                audioEncoding == RecognitionConfig.Types.AudioEncoding.Mulaw)
            {
                config.SampleRateHertz = sampleRateHertz;
            }

            var audio = new RecognitionAudio
            {
                Content = ByteString.CopyFrom(audioBytes)
            };

            var response = await _client.RecognizeAsync(config, audio);

            var result = new SpeechRecognitionResult
            {
                Alternatives = response.Results
                    .SelectMany(result => result.Alternatives)
                    .Select(alt => new SpeechAlternative
                    {
                        Transcript = alt.Transcript,
                        Confidence = alt.Confidence,
                        Words = alt.Words?.Select(word => new WordInfo
                        {
                            Word = word.Word,
                            StartTime = word.StartTime?.ToTimeSpan(),
                            EndTime = word.EndTime?.ToTimeSpan(),
                            Confidence = word.Confidence
                        }).ToList() ?? new List<WordInfo>()
                    }).ToList()
            };

            _logger.LogInformation("Successfully transcribed audio with {Count} alternatives", result.Alternatives.Count);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting speech to text with detailed results");
            throw;
        }
    }

    /// <summary>
    /// Gets supported languages for speech recognition
    /// </summary>
    /// <returns>List of supported language codes</returns>
    public List<string> GetSupportedLanguages()
    {
        return new List<string>
        {
            "en-US", "en-GB", "en-AU", "en-CA", "en-IN",
            "es-ES", "es-MX", "es-AR", "es-CO", "es-PE",
            "fr-FR", "fr-CA", "de-DE", "it-IT", "pt-BR",
            "pt-PT", "ru-RU", "ja-JP", "ko-KR", "zh-CN",
            "zh-TW", "nl-NL", "sv-SE", "da-DK", "no-NO",
            "fi-FI", "pl-PL", "cs-CZ", "sk-SK", "hu-HU",
            "ro-RO", "bg-BG", "hr-HR", "sl-SI", "et-EE",
            "lv-LV", "lt-LT", "is-IS", "mt-MT", "ga-IE",
            "cy-GB", "eu-ES", "ca-ES", "gl-ES", "ar-SA",
            "he-IL", "hi-IN", "th-TH", "vi-VN", "id-ID",
            "ms-MY", "tl-PH", "uk-UA", "tr-TR", "fa-IR"
        };
    }

    /// <summary>
    /// Dispose of the Speech client
    /// </summary>
    public void Dispose()
    {
        // _client?.Dispose();
        _logger.LogInformation("SpeechToTextService disposed");
    }
}

// Supporting classes for detailed results
public class SpeechRecognitionResult
{
    public List<SpeechAlternative> Alternatives { get; set; } = new();
}

public class SpeechAlternative
{
    public string Transcript { get; set; } = string.Empty;
    public float Confidence { get; set; }
    public List<WordInfo> Words { get; set; } = new();
}

public class WordInfo
{
    public string Word { get; set; } = string.Empty;
    public TimeSpan? StartTime { get; set; }
    public TimeSpan? EndTime { get; set; }
    public float Confidence { get; set; }
}