using System.ComponentModel.DataAnnotations;
using ChatbotBackend.LLMServices;
using ChatbotBackend.Model;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("api/tts")]
    public class TextToSpeechController : ControllerBase
    {
        private readonly TextToSpeechService _ttsService;
        private readonly ILogger<TextToSpeechController> _logger;

        public TextToSpeechController(TextToSpeechService ttsService, ILogger<TextToSpeechController> logger)
        {
            _ttsService = ttsService;
            _logger = logger;
        }

        /// <summary>
        /// Convert text to speech
        /// </summary>
        [HttpPost("synthesize")]
        public async Task<IActionResult> SynthesizeText([FromBody] TextToSpeechRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Parse enums from string values
                var voiceGender = TTSEnumConverter.ParseVoiceGender(request.VoiceGender);
                var audioEncoding = TTSEnumConverter.ParseAudioEncoding(request.AudioEncoding);

                byte[] audioContent;

                // Choose between text and SSML synthesis
                if (request.IsSSML)
                {
                    audioContent = await _ttsService.ConvertSsmlToSpeechAsync(
                        request.Text,
                        request.LanguageCode,
                        request.VoiceName,
                        voiceGender,
                        audioEncoding);
                }
                else
                {
                    audioContent = await _ttsService.ConvertTextToSpeechAsync(
                        request.Text,
                        request.LanguageCode,
                        request.VoiceName,
                        voiceGender,
                        audioEncoding);
                }

                // Convert to base64 for JSON response
                var audioBase64 = Convert.ToBase64String(audioContent);

                var response = new TextToSpeechResponse
                {
                    Message = "Text successfully converted to speech",
                    AudioBase64 = audioBase64,
                    AudioFormat = request.AudioEncoding.ToLower(),
                    AudioSizeBytes = audioContent.Length
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error synthesizing text to speech");
                return StatusCode(500, new
                {
                    message = "Error converting text to speech",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get audio file directly (returns binary audio data)
        /// </summary>
        [HttpPost("synthesize/audio")]
        public async Task<IActionResult> SynthesizeTextToAudio([FromBody] TextToSpeechRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Parse enums from string values
                var voiceGender = TTSEnumConverter.ParseVoiceGender(request.VoiceGender);
                var audioEncoding = TTSEnumConverter.ParseAudioEncoding(request.AudioEncoding);

                byte[] audioContent;

                // Choose between text and SSML synthesis
                if (request.IsSSML)
                {
                    audioContent = await _ttsService.ConvertSsmlToSpeechAsync(
                        request.Text,
                        request.LanguageCode,
                        request.VoiceName,
                        voiceGender,
                        audioEncoding);
                }
                else
                {
                    audioContent = await _ttsService.ConvertTextToSpeechAsync(
                        request.Text,
                        request.LanguageCode,
                        request.VoiceName,
                        voiceGender,
                        audioEncoding);
                }

                // Determine content type based on audio encoding
                var contentType = request.AudioEncoding.ToUpper() switch
                {
                    "MP3" => "audio/mpeg",
                    "LINEAR16" => "audio/wav",
                    "OGG_OPUS" => "audio/ogg",
                    _ => "audio/mpeg"
                };

                // Return the audio file directly
                return File(audioContent, contentType, $"speech.{request.AudioEncoding.ToLower()}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error synthesizing text to speech audio");
                return StatusCode(500, new
                {
                    message = "Error converting text to speech",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get list of available voices
        /// </summary>
        [HttpGet("voices")]
        public async Task<IActionResult> GetAvailableVoices([FromQuery] string? languageCode = null)
        {
            try
            {
                var voices = await _ttsService.GetAvailableVoicesAsync(languageCode);

                var voiceList = voices.Select(v => new VoiceInfo
                {
                    Name = v.Name,
                    LanguageCode = v.LanguageCodes.FirstOrDefault() ?? "Unknown",
                    Gender = TTSEnumConverter.VoiceGenderToString(v.SsmlGender),
                    NaturalSampleRateHertz = v.NaturalSampleRateHertz.ToString()
                }).ToList();

                var response = new ListVoicesResponse
                {
                    Message = $"Retrieved {voiceList.Count} available voices",
                    Voices = voiceList
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available voices");
                return StatusCode(500, new
                {
                    message = "Error retrieving available voices",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Convert chat response to speech (integration with existing chat endpoint)
        /// </summary>
        [HttpPost("chat-to-speech")]
        public async Task<IActionResult> ConvertChatToSpeech([FromBody] ChatToSpeechRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Parse enums from string values
                var voiceGender = TTSEnumConverter.ParseVoiceGender(request.VoiceGender ?? "Neutral");
                var audioEncoding = TTSEnumConverter.ParseAudioEncoding(request.AudioEncoding ?? "MP3");

                // Convert the chat response to speech
                var audioContent = await _ttsService.ConvertTextToSpeechAsync(
                    request.ChatResponse,
                    request.LanguageCode ?? "en-AU",
                    request.VoiceName,
                    voiceGender,
                    audioEncoding);

                // Convert to base64 for JSON response
                var audioBase64 = Convert.ToBase64String(audioContent);

                var response = new TextToSpeechResponse
                {
                    Message = "Chat response successfully converted to speech",
                    AudioBase64 = audioBase64,
                    AudioFormat = (request.AudioEncoding ?? "MP3").ToLower(),
                    AudioSizeBytes = audioContent.Length
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error converting chat response to speech");
                return StatusCode(500, new
                {
                    message = "Error converting chat response to speech",
                    error = ex.Message
                });
            }
        }
    }

    // Additional model for chat-to-speech endpoint
    public class ChatToSpeechRequest
    {
        [Required]
        public required string ChatResponse { get; set; }
        
        public string? LanguageCode { get; set; }
        public string? VoiceName { get; set; }
        public string? VoiceGender { get; set; }
        public string? AudioEncoding { get; set; }
    }
}