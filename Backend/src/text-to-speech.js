// text-to-speech.js - Simplified version without mime dependency
const { GoogleGenAI } = require("@google/genai");
const { writeFile } = require("fs");

async function main(voiceName = "Zephyr", text) {
  try {
    if (!process.env.API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.API_KEY,
    });

    const config = {
      temperature: 1,
      responseModalities: ["audio"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName,
          },
        },
      },
    };

    const model = "gemini-2.5-flash-preview-tts";

    // Correct payload structure
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: text,
          },
        ],
      },
    ];

    console.log("Making API request to Google AI...");

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    const audioChunks = [];
    let chunkCount = 0;

    for await (const chunk of response) {
      chunkCount++;
      console.log(`Processing chunk ${chunkCount}`);

      if (
        !chunk.candidates ||
        !chunk.candidates[0].content ||
        !chunk.candidates[0].content.parts
      ) {
        console.log("Skipping chunk - no valid content");
        continue;
      }

      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        console.log("Found audio data:", {
          mimeType: inlineData.mimeType,
          dataLength: inlineData.data?.length || 0,
        });

        // Simply convert all audio to buffer - no format checking needed
        let buffer = Buffer.from(inlineData.data || "", "base64");

        // Most Google AI audio comes in a usable format, but we can
        // convert to WAV for maximum compatibility if needed
        if (shouldConvertToWav(inlineData.mimeType)) {
          console.log("Converting to WAV for compatibility");
          buffer = convertToWav(buffer, inlineData.mimeType);
        }

        audioChunks.push(buffer);
      } else if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.log(
          "Text response:",
          chunk.candidates[0].content.parts[0].text
        );
      }
    }

    if (audioChunks.length === 0) {
      throw new Error(
        "No audio data received from API. Check if the model supports TTS and your API key has access."
      );
    }

    // Combine all audio chunks
    const combinedBuffer = Buffer.concat(audioChunks);
    console.log(`Generated audio: ${combinedBuffer.length} bytes`);

    // Return base64 encoded audio for frontend
    return {
      audioData: combinedBuffer.toString("base64"),
      mimeType: "audio/wav", // Always return as WAV for consistency
      success: true,
      message: "Speech generated successfully",
      audioSize: combinedBuffer.length,
      chunkCount: audioChunks.length,
    };
  } catch (error) {
    console.error("Error in main function:", error);

    // Specific error handling
    if (error.message && error.message.includes("status: 400")) {
      console.error(
        "API Error 400: Check your request format and API key permissions"
      );
    } else if (error.message && error.message.includes("status: 401")) {
      console.error("API Error 401: Invalid API key");
    } else if (error.message && error.message.includes("status: 403")) {
      console.error("API Error 403: API key doesn't have access to this model");
    }

    throw error;
  }
}

// Simple function to determine if we should convert to WAV
function shouldConvertToWav(mimeType) {
  if (!mimeType) return true;

  // List of formats that typically work well in browsers
  const browserCompatibleFormats = [
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/webm",
  ];

  return !browserCompatibleFormats.includes(mimeType.toLowerCase());
}

// Simplified WAV conversion - just add WAV header to raw audio data
function convertToWav(audioBuffer, originalMimeType) {
  try {
    // Default audio settings for speech
    const sampleRate = 24000; // 24kHz is common for speech
    const channels = 1; // Mono
    const bitsPerSample = 16; // 16-bit

    const wavHeader = createWavHeader(audioBuffer.length, {
      numChannels: channels,
      sampleRate: sampleRate,
      bitsPerSample: bitsPerSample,
    });

    return Buffer.concat([wavHeader, audioBuffer]);
  } catch (error) {
    console.error("Error converting to WAV:", error);
    // If conversion fails, return original buffer
    return audioBuffer;
  }
}

function createWavHeader(dataLength, options) {
  const { numChannels, sampleRate, bitsPerSample } = options;

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  // Standard WAV header
  buffer.write("RIFF", 0); // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
  buffer.write("WAVE", 8); // Format
  buffer.write("fmt ", 12); // Subchunk1ID
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  buffer.write("data", 36); // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}

function saveBinaryFile(fileName, content) {
  writeFile(fileName, content, (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
}

module.exports = {
  main,
  convertToWav,
  createWavHeader,
  saveBinaryFile,
  shouldConvertToWav,
};
