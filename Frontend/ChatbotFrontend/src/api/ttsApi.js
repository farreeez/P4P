import createAsync from "../hooks/CreateAsync.js";
import getAsync from "../hooks/GetAsync.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_TTS_URL = `${API_BASE_URL}/api/tts`;

export class TTS {
  /**
   * Convert text to speech and get base64 audio
   */
  static synthesizeAsync() {
    const { data, isLoading, isError, post } = createAsync();

    async function synthesize(text, options = {}) {
      const request = {
        text: text,
        languageCode: options.languageCode ?? "en-US",
        voiceName: options.voiceName ?? "en-US-Chirp3-HD-Kore",
        voiceGender: options.voiceGender ?? "Female",
        audioEncoding: options.audioEncoding ?? "MP3",
        isSSML: options.isSSML ?? false
      };

      const response = await post(`${API_TTS_URL}/synthesize`, request);
      return response;
    }

    return { synthesize, isLoading, isError, data };
  }

  /**
   * Convert text to speech and get audio file
   */
  static synthesizeAudioAsync() {
    const { data, isLoading, isError, post } = createAsync();

    async function synthesizeAudio(text, options = {}) {
      const request = {
        text: text,
        languageCode: options.languageCode ?? "en-US",
        voiceName: options.voiceName ?? "en-US-Chirp3-HD-Kore",
        voiceGender: options.voiceGender ?? "Female",
        audioEncoding: options.audioEncoding ?? "MP3",
        isSSML: options.isSSML ?? false
      };

      const response = await post(`${API_TTS_URL}/synthesize/audio`, request, {
        responseType: 'blob'
      });
      return response;
    }

    return { synthesizeAudio, isLoading, isError, data };
  }

  /**
   * Get available voices
   */
  static getVoicesAsync() {
    const { data, isLoading, isError, fetch } = getAsync();

    async function getVoices(languageCode = null) {
      const url = languageCode
        ? `${API_TTS_URL}/voices?languageCode=${encodeURIComponent(languageCode)}`
        : `${API_TTS_URL}/voices`;
      const voices = await fetch(url);
      return voices ?? { voices: [] };
    }

    return { getVoices, data, isLoading, isError };
  }

  /**
   * Convert chat response to speech
   */
  static chatToSpeechAsync() {
    const { data, isLoading, isError, post } = createAsync();

    async function chatToSpeech(chatResponse, options = {}) {
      const request = {
        chatResponse: chatResponse,
        languageCode: options.languageCode,
        voiceName: options.voiceName,
        voiceGender: options.voiceGender,
        audioEncoding: options.audioEncoding
      };

      const response = await post(`${API_TTS_URL}/chat-to-speech`, request);
      return response;
    }

    return { chatToSpeech, isLoading, isError, data };
  }
}
