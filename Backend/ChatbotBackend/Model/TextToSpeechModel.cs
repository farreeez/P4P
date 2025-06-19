using Google.Cloud.TextToSpeech.V1;
using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Model
{
    public class TextToSpeechRequest
    {
        [Required]
        public required string Text { get; set; }
        
        public string LanguageCode { get; set; } = "en-AU";

        public string? VoiceName { get; set; } = "en-AU-Chirp3-HD-Kore";
        
        public string VoiceGender { get; set; } = "Female"; // Neutral, Male, Female
        
        public string AudioEncoding { get; set; } = "MP3"; // MP3, LINEAR16, OGG_OPUS
        
        public bool IsSSML { get; set; } = false;
    }

    public class TextToSpeechResponse
    {
        public required string Message { get; set; }
        public required string AudioBase64 { get; set; }
        public required string AudioFormat { get; set; }
        public int AudioSizeBytes { get; set; }
    }

    public class VoiceInfo
    {
        public required string Name { get; set; }
        public required string LanguageCode { get; set; }
        public required string Gender { get; set; }
        public required string NaturalSampleRateHertz { get; set; }
    }

    public class ListVoicesResponse
    {
        public required string Message { get; set; }
        public required List<VoiceInfo> Voices { get; set; }
    }

    // Helper class to convert between string and enum values
    public static class TTSEnumConverter
    {
        public static SsmlVoiceGender ParseVoiceGender(string gender)
        {
            return gender.ToUpper() switch
            {
                "MALE" => SsmlVoiceGender.Male,
                "FEMALE" => SsmlVoiceGender.Female,
                "NEUTRAL" => SsmlVoiceGender.Neutral,
                _ => SsmlVoiceGender.Neutral
            };
        }

        public static AudioEncoding ParseAudioEncoding(string encoding)
        {
            return encoding.ToUpper() switch
            {
                "MP3" => AudioEncoding.Mp3,
                "LINEAR16" => AudioEncoding.Linear16,
                "OGG_OPUS" => AudioEncoding.OggOpus,
                "MULAW" => AudioEncoding.Mulaw,
                "ALAW" => AudioEncoding.Alaw,
                _ => AudioEncoding.Mp3
            };
        }

        public static string VoiceGenderToString(SsmlVoiceGender gender)
        {
            return gender switch
            {
                SsmlVoiceGender.Male => "Male",
                SsmlVoiceGender.Female => "Female",
                SsmlVoiceGender.Neutral => "Neutral",
                _ => "Neutral"
            };
        }
    }
}