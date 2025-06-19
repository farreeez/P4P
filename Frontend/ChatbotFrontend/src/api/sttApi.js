import createAsync from "../hooks/CreateAsync.js";
import getAsync from "../hooks/GetAsync.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_STT_URL = `${API_BASE_URL}/api/stt`;

export class STT {
  /**
   * Transcribe audio file (multipart/form-data)
   */
  static transcribeAsync() {
    const { data, isLoading, isError, post } = createAsync();

    /**
     * @param {File} audioFile
     * @param {Object} options
     * @returns {Promise<Object>}
     */
    async function transcribe(audioFile, options = {}) {
      const formData = new FormData();
      formData.append("audioFile", audioFile);
      if (options.languageCode) formData.append("languageCode", options.languageCode);
      if (options.sampleRate) formData.append("sampleRate", options.sampleRate);
      if (options.audioEncoding) formData.append("audioEncoding", options.audioEncoding);

      const response = await post(`${API_STT_URL}/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response;
    }

    return { transcribe, isLoading, isError, data };
  }

  /**
   * Transcribe audio file with detailed results (multipart/form-data)
   */
  static transcribeDetailedAsync() {
    const { data, isLoading, isError, post } = createAsync();

    async function transcribeDetailed(audioFile, options = {}) {
      const formData = new FormData();
      formData.append("audioFile", audioFile);
      if (options.languageCode) formData.append("languageCode", options.languageCode);
      if (options.sampleRate) formData.append("sampleRate", options.sampleRate);
      if (options.audioEncoding) formData.append("audioEncoding", options.audioEncoding);
      if (options.maxAlternatives) formData.append("maxAlternatives", options.maxAlternatives);

      const response = await post(`${API_STT_URL}/transcribe-detailed`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response;
    }

    return { transcribeDetailed, isLoading, isError, data };
  }

  /**
   * Transcribe base64 audio
   */
  static transcribeBase64Async() {
    const { data, isLoading, isError, post } = createAsync();

    async function transcribeBase64(audioBase64, options = {}) {
      const request = {
        audioBase64,
        languageCode: options.languageCode,
        sampleRate: options.sampleRate,
        audioEncoding: options.audioEncoding
      };
      const response = await post(`${API_STT_URL}/transcribe-base64`, request);
      return response;
    }

    return { transcribeBase64, isLoading, isError, data };
  }

  /**
   * Get supported languages
   */
  static getSupportedLanguagesAsync() {
    const { data, isLoading, isError, fetch } = getAsync();

    async function getSupportedLanguages() {
      const response = await fetch(`${API_STT_URL}/supported-languages`);
      return response?.languages ?? [];
    }

    return { getSupportedLanguages, data, isLoading, isError };
  }
}
