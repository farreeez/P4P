/**
 * Plays audio from a base64 string
 * @param {Object} synthesizeResponse - Response from TTS API
 * @returns {Promise<void>}
 */
export async function playAudioFromBase64(synthesizeResponse) {
    try {
        // Convert base64 to blob
        const base64 = synthesizeResponse.audioBase64;
        const format = synthesizeResponse.audioFormat;
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: `audio/${format}` });
        
        // Create audio element and play
        const audio = new Audio(URL.createObjectURL(blob));
        await audio.play();
        
        // Cleanup URL after audio finishes playing
        audio.onended = () => {
            URL.revokeObjectURL(audio.src);
        };
    } catch (error) {
        console.error('Error playing audio:', error);
        throw error;
    }
}
