using Google.Cloud.TextToSpeech.V1;
using Google.Protobuf;

namespace ChatbotBackend.LLMServices
{
    public class TextToSpeechService
    {
        private readonly TextToSpeechClient _client;
        private readonly ILogger<TextToSpeechService> _logger;

        public TextToSpeechService(ILogger<TextToSpeechService> logger, IConfiguration configuration)
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
                _client = TextToSpeechClient.Create();
                _logger.LogInformation("Successfully initialized Google Cloud TTS client");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialize Google Cloud TTS client");
                throw new InvalidOperationException("Failed to initialize Google Cloud Text-to-Speech client. Please check your credentials configuration.", ex);
            }
        }

        /// <summary>
        /// Converts text to speech and returns the audio content as byte array
        /// </summary>
        /// <param name="text">The text to convert to speech</param>
        /// <param name="languageCode">Language code (e.g., "en-US", "es-ES")</param>
        /// <param name="voiceName">Specific voice name (optional)</param>
        /// <param name="voiceGender">Voice gender preference</param>
        /// <param name="audioEncoding">Audio encoding format</param>
        /// <param name="speechRate">Speech rate (default is 1.0)</param>
        /// <returns>Audio content as byte array</returns>
        public async Task<byte[]> ConvertTextToSpeechAsync(
            string text,
            string languageCode = "en-AU",
            string? voiceName = null,
            SsmlVoiceGender voiceGender = SsmlVoiceGender.Neutral,
            AudioEncoding audioEncoding = AudioEncoding.Mp3,
            double speechRate = 1.0)
        {
            try
            {
                // Create the synthesis input
                var input = new SynthesisInput
                {
                    Text = text
                };

                // Create voice selection
                var voice = new VoiceSelectionParams
                {
                    LanguageCode = languageCode,
                    SsmlGender = voiceGender
                };

                // Set specific voice name if provided
                if (!string.IsNullOrEmpty(voiceName))
                {
                    voice.Name = voiceName;
                }

                // Create audio config with speech rate
                var config = new AudioConfig
                {
                    AudioEncoding = audioEncoding,
                    SpeakingRate = speechRate
                };

                // Perform the text-to-speech request
                var response = await _client.SynthesizeSpeechAsync(new SynthesizeSpeechRequest
                {
                    Input = input,
                    Voice = voice,
                    AudioConfig = config
                });

                _logger.LogInformation("Successfully converted text to speech. Audio length: {Length} bytes", response.AudioContent.Length);

                return response.AudioContent.ToByteArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting text to speech");
                throw;
            }
        }

        /// <summary>
        /// Converts SSML to speech and returns the audio content as byte array
        /// </summary>
        /// <param name="ssml">The SSML content to convert to speech</param>
        /// <param name="languageCode">Language code</param>
        /// <param name="voiceName">Specific voice name (optional)</param>
        /// <param name="voiceGender">Voice gender preference</param>
        /// <param name="audioEncoding">Audio encoding format</param>
        /// <param name="speechRate">Speech rate (default is 1.0)</param>
        /// <returns>Audio content as byte array</returns>
        public async Task<byte[]> ConvertSsmlToSpeechAsync(
            string ssml,
            string languageCode = "en-AU",
            string? voiceName = null,
            SsmlVoiceGender voiceGender = SsmlVoiceGender.Neutral,
            AudioEncoding audioEncoding = AudioEncoding.Mp3,
            double speechRate = 1.0)
        {
            try
            {
                // Create the synthesis input with SSML
                var input = new SynthesisInput
                {
                    Ssml = ssml
                };

                // Create voice selection
                var voice = new VoiceSelectionParams
                {
                    LanguageCode = languageCode,
                    SsmlGender = voiceGender
                };

                // Set specific voice name if provided
                if (!string.IsNullOrEmpty(voiceName))
                {
                    voice.Name = voiceName;
                }

                // Create audio config with speech rate
                var config = new AudioConfig
                {
                    AudioEncoding = audioEncoding,
                    SpeakingRate = speechRate
                };

                // Perform the text-to-speech request
                var response = await _client.SynthesizeSpeechAsync(new SynthesizeSpeechRequest
                {
                    Input = input,
                    Voice = voice,
                    AudioConfig = config
                });

                _logger.LogInformation("Successfully converted SSML to speech. Audio length: {Length} bytes", response.AudioContent.Length);

                return response.AudioContent.ToByteArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting SSML to speech");
                throw;
            }
        }

        /// <summary>
        /// Gets available voices for a specific language
        /// </summary>
        /// <param name="languageCode">Language code to filter voices</param>
        /// <returns>List of available voices</returns>
        public async Task<IEnumerable<Voice>> GetAvailableVoicesAsync(string? languageCode = null)
        {
            try
            {
                var request = new ListVoicesRequest();

                if (!string.IsNullOrEmpty(languageCode))
                {
                    request.LanguageCode = languageCode;
                }

                var response = await _client.ListVoicesAsync(request);

                _logger.LogInformation("Retrieved {Count} available voices", response.Voices.Count);

                return response.Voices;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available voices");
                throw;
            }
        }

        /// <summary>
        /// Dispose of the TTS client
        /// </summary>
        public void Dispose()
        {
            // _client?.Dispose();
            _logger.LogInformation("TextToSpeechService disposed");
        }
    }
}