import axios from 'axios';

const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Default voice ID for financial professional tone
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel voice

export async function textToSpeech(text: string): Promise<Buffer> {
  try {
    const response = await axios.post(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${VOICE_ID}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.9,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    throw error;
  }
}

export async function getAvailableVoices() {
  try {
    const response = await axios.get(`${ELEVENLABS_BASE_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices;
  } catch (error) {
    console.error('ElevenLabs voices error:', error);
    throw error;
  }
}
