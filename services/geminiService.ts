import { GoogleGenAI, Modality, Chat, GenerateContentResponse } from "@google/genai";

// Singleton instance holder
let aiInstance: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    if (!process.env.API_KEY) {
      throw new Error("API Key is missing. Please set process.env.API_KEY");
    }
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

// --- Helper: Convert File to Base64 ---
export const fileToGenericPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- Chat Feature ---
let chatSession: Chat | null = null;

export const sendMessageStream = async (
  message: string,
  onChunk: (text: string) => void
): Promise<void> => {
  const ai = getAI();
  
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are a helpful, intelligent, and versatile AI assistant.",
      },
    });
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            onChunk(c.text);
        }
    }
  } catch (error) {
    console.error("Chat error:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
};

// --- Image Analysis Feature ---
export const analyzeImage = async (file: File, prompt: string): Promise<string> => {
  const ai = getAI();
  const imagePart = await fileToGenericPart(file);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using 3-pro-preview for best vision capabilities
      contents: {
        parts: [
            imagePart,
            { text: prompt || "Analyze this image in detail." }
        ]
      }
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
};

// --- Storyteller Feature (Vision -> Text) ---
export const generateStoryFromImage = async (file: File): Promise<string> => {
  const ai = getAI();
  const imagePart = await fileToGenericPart(file);
  
  const prompt = `
    Analyze the mood, lighting, and scenery of this image. 
    Then, ghostwrite a creative, atmospheric opening paragraph (approx 150-200 words) 
    for a story set in this world. Focus on sensory details.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
            imagePart,
            { text: prompt }
        ]
      }
    });
    return response.text || "Could not generate story.";
  } catch (error) {
    console.error("Story generation error:", error);
    throw error;
  }
};

// --- TTS Feature (Text -> Audio) ---
// Decodes base64 string to Uint8Array
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Decodes raw PCM data to AudioBuffer
async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}

export const speakText = async (text: string): Promise<void> => {
    const ai = getAI();
    
    // Clean up text slightly to remove markdown for better speech (optional basic cleanup)
    const cleanText = text.replace(/\*/g, '').replace(/#/g, '');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: cleanText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Fenrir' }, // Deep, storytelling voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            throw new Error("No audio data returned");
        }

        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const outputNode = outputAudioContext.createGain();
        outputNode.connect(outputAudioContext.destination);

        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            outputAudioContext,
            24000,
            1,
        );

        const source = outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outputNode);
        source.start();
        
        // Return a promise that resolves when audio ends
        return new Promise((resolve) => {
            source.onended = () => {
                outputAudioContext.close();
                resolve();
            };
        });

    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};
