using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Speech.V1;
using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("api/stt")]
    public class SpeechToTextController : ControllerBase
    {
        private readonly SpeechToTextService _sttService;
        private readonly ILogger<SpeechToTextController> _logger;

        public SpeechToTextController(SpeechToTextService sttService, ILogger<SpeechToTextController> logger)
        {
            _sttService = sttService;
            _logger = logger;
        }

        /// <summary>
        /// Convert speech audio to text
        /// </summary>
        /// <param name="audioFile">Audio file to transcribe</param>
        /// <param name="languageCode">Language code (e.g., "en-US")</param>
        /// <param name="sampleRate">Sample rate of the audio</param>
        /// <param name="audioEncoding">Audio encoding format</param>
        /// <returns>Transcribed text</returns>
        [HttpPost("transcribe")]
        public async Task<IActionResult> TranscribeAudio(
            IFormFile audioFile,
            [FromForm] string languageCode = "en-US",
            [FromForm] int sampleRate = 16000,
            [FromForm] string audioEncoding = "WEBM_OPUS")
        {
            if (audioFile == null || audioFile.Length == 0)
            {
                return BadRequest(new { message = "Audio file is required" });
            }

            try
            {
                // Convert audio file to byte array
                byte[] audioBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await audioFile.CopyToAsync(memoryStream);
                    audioBytes = memoryStream.ToArray();
                }

                // Parse audio encoding
                var encoding = STTEnumConverter.ParseAudioEncoding(audioEncoding);

                // Transcribe audio
                var transcription = await _sttService.ConvertSpeechToTextAsync(
                    audioBytes,
                    languageCode,
                    sampleRate,
                    encoding);

                var response = new SpeechToTextResponse
                {
                    Message = "Audio successfully transcribed",
                    Transcription = transcription,
                    LanguageCode = languageCode,
                    AudioSizeBytes = audioBytes.Length,
                    AudioFormat = audioFile.ContentType ?? "unknown"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transcribing audio");
                return StatusCode(500, new
                {
                    message = "Error transcribing audio",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Convert speech audio to text with detailed results
        /// </summary>
        /// <param name="audioFile">Audio file to transcribe</param>
        /// <param name="languageCode">Language code</param>
        /// <param name="sampleRate">Sample rate of the audio</param>
        /// <param name="audioEncoding">Audio encoding format</param>
        /// <param name="maxAlternatives">Maximum number of alternatives</param>
        /// <returns>Detailed transcription results</returns>
        [HttpPost("transcribe-detailed")]
        public async Task<IActionResult> TranscribeAudioDetailed(
            IFormFile audioFile,
            [FromForm] string languageCode = "en-AU",
            [FromForm] int sampleRate = 16000,
            [FromForm] string audioEncoding = "WEBM_OPUS",
            [FromForm] int maxAlternatives = 3)
        {
            if (audioFile == null || audioFile.Length == 0)
            {
                return BadRequest(new { message = "Audio file is required" });
            }

            try
            {
                // Convert audio file to byte array
                byte[] audioBytes;
                using (var memoryStream = new MemoryStream())
                {
                    await audioFile.CopyToAsync(memoryStream);
                    audioBytes = memoryStream.ToArray();
                }

                // Parse audio encoding
                var encoding = STTEnumConverter.ParseAudioEncoding(audioEncoding);

                // Transcribe audio with detailed results
                var result = await _sttService.ConvertSpeechToTextDetailedAsync(
                    audioBytes,
                    languageCode,
                    sampleRate,
                    encoding,
                    maxAlternatives);

                var response = new DetailedSpeechToTextResponse
                {
                    Message = "Audio successfully transcribed with detailed results",
                    Results = result,
                    LanguageCode = languageCode,
                    AudioSizeBytes = audioBytes.Length,
                    AudioFormat = audioFile.ContentType ?? "unknown"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transcribing audio with detailed results");
                return StatusCode(500, new
                {
                    message = "Error transcribing audio",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Convert speech from base64 audio data to text
        /// </summary>
        /// <param name="request">Speech to text request with base64 audio</param>
        /// <returns>Transcribed text</returns>
        [HttpPost("transcribe-base64")]
        public async Task<IActionResult> TranscribeBase64Audio([FromBody] SpeechToTextBase64Request request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Convert base64 to byte array
                byte[] audioBytes = Convert.FromBase64String(request.AudioBase64);

                // Parse audio encoding
                var encoding = STTEnumConverter.ParseAudioEncoding(request.AudioEncoding ?? "WEBM_OPUS");

                // Transcribe audio
                var transcription = await _sttService.ConvertSpeechToTextAsync(
                    audioBytes,
                    request.LanguageCode ?? "en-AU",
                    request.SampleRate ?? 16000,
                    encoding);

                var response = new SpeechToTextResponse
                {
                    Message = "Audio successfully transcribed",
                    Transcription = transcription,
                    LanguageCode = request.LanguageCode ?? "en-AU",
                    AudioSizeBytes = audioBytes.Length,
                    AudioFormat = request.AudioEncoding ?? "webm"
                };

                return Ok(response);
            }
            catch (FormatException)
            {
                return BadRequest(new { message = "Invalid base64 audio data" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transcribing base64 audio");
                return StatusCode(500, new
                {
                    message = "Error transcribing audio",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get supported languages for speech recognition
        /// </summary>
        /// <returns>List of supported language codes</returns>
        [HttpGet("supported-languages")]
        public IActionResult GetSupportedLanguages()
        {
            try
            {
                var languages = _sttService.GetSupportedLanguages();
                return Ok(new { languages = languages });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting supported languages");
                return StatusCode(500, new
                {
                    message = "Error getting supported languages",
                    error = ex.Message
                });
            }
        }
    }

    // Request/Response models
    public class SpeechToTextBase64Request
    {
        [Required]
        public required string AudioBase64 { get; set; }
        
        public string? LanguageCode { get; set; }
        public int? SampleRate { get; set; }
        public string? AudioEncoding { get; set; }
    }

    public class SpeechToTextResponse
    {
        public required string Message { get; set; }
        public required string Transcription { get; set; }
        public required string LanguageCode { get; set; }
        public required string AudioFormat { get; set; }
        public int AudioSizeBytes { get; set; }
    }

    public class DetailedSpeechToTextResponse
    {
        public required string Message { get; set; }
        public required SpeechRecognitionResult Results { get; set; }
        public required string LanguageCode { get; set; }
        public required string AudioFormat { get; set; }
        public int AudioSizeBytes { get; set; }
    }

    // Enum converter for Speech-to-Text
    public static class STTEnumConverter
    {
        public static RecognitionConfig.Types.AudioEncoding ParseAudioEncoding(string encoding)
        {
            return encoding?.ToUpper() switch
            {
                "LINEAR16" => RecognitionConfig.Types.AudioEncoding.Linear16,
                "FLAC" => RecognitionConfig.Types.AudioEncoding.Flac,
                "MULAW" => RecognitionConfig.Types.AudioEncoding.Mulaw,
                "AMR" => RecognitionConfig.Types.AudioEncoding.Amr,
                "AMR_WB" => RecognitionConfig.Types.AudioEncoding.AmrWb,
                "OGG_OPUS" => RecognitionConfig.Types.AudioEncoding.OggOpus,
                "SPEEX_WITH_HEADER_BYTE" => RecognitionConfig.Types.AudioEncoding.SpeexWithHeaderByte,
                "WEBM_OPUS" or "WEBM" => RecognitionConfig.Types.AudioEncoding.WebmOpus,
                "MP3" => RecognitionConfig.Types.AudioEncoding.Mp3,
                _ => RecognitionConfig.Types.AudioEncoding.WebmOpus
            };
        }
    }
}