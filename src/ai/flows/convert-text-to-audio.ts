'use server';
/**
 * @fileOverview A unified flow to convert various inputs (text, audio, video, documents) into simplified text and audio.
 *
 * - convertFile - The main function for converting files/text to simplified text and audio.
 * - textToSpeech - A function to convert text directly to speech.
 * - ConvertFileInput - The input type for convertFile.
 * - ConvertFileOutput - The return type for convertFile.
 * - TextToSpeechInput - The input type for textToSpeech.
 * - TextToSpeechOutput - The return type for textToSpeech.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';
import {summarizeText} from '@/ai/flows/summarize-text';

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', d => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

// Schemas and flow for the main multimedia converter
const ConvertFileInputSchema = z.object({
  inputText: z.string().optional().describe('Text to be processed.'),
  fileDataUri: z
    .string()
    .optional()
    .describe(
      "A file (audio, video, image, PDF, Word) as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ConvertFileInput = z.infer<typeof ConvertFileInputSchema>;

const ConvertFileOutputSchema = z.object({
  simplifiedText: z.string().describe('The simplified text explanation.'),
  audioDataUri: z
    .string()
    .describe('The generated audio explanation as a data URI.'),
});
export type ConvertFileOutput = z.infer<typeof ConvertFileOutputSchema>;

export async function convertFile(
  input: ConvertFileInput
): Promise<ConvertFileOutput> {
  return convertFileFlow(input);
}

// Schemas and flow for simple Text-to-Speech
const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to audio.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI.'),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({text}) => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('Failed to generate audio from text.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

// Internal flow for extracting text from media files
const ExtractTextFromMediaInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "A file (audio, video, image, PDF, Word) as a data URI."
    ),
});
const ExtractTextFromMediaOutputSchema = z.object({
  extractedText: z
    .string()
    .describe('The extracted text from the media file.'),
});

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: {schema: ExtractTextFromMediaInputSchema},
  output: {schema: ExtractTextFromMediaOutputSchema},
  prompt: `You are an expert at data extraction.
Accurately extract all text content from the provided file.
- For audio or video, provide a full and accurate transcription.
- For an image or document (like a PDF or Word file), use OCR to extract all the text.

If you cannot extract any text, return an empty string for the 'extractedText' field.

File: {{media url=fileDataUri}}

Return ONLY the extracted text in the 'extractedText' field of the JSON output.`,
});

const extractTextFromMediaFlow = ai.defineFlow(
  {
    name: 'extractTextFromMediaFlow',
    inputSchema: ExtractTextFromMediaInputSchema,
    outputSchema: ExtractTextFromMediaOutputSchema,
  },
  async ({fileDataUri}) => {
    const {output} = await extractTextPrompt({fileDataUri});
    // It's okay if output is null or extractedText is empty, the calling flow will handle it.
    return {extractedText: output?.extractedText || ''};
  }
);

// Main conversion flow, now refactored for reliability
const convertFileFlow = ai.defineFlow(
  {
    name: 'convertFileFlow',
    inputSchema: ConvertFileInputSchema,
    outputSchema: ConvertFileOutputSchema,
  },
  async input => {
    let textToProcess = '';

    // Step 1: Get the text, either from input or by extracting from a file
    if (input.fileDataUri) {
      const extractionResult = await extractTextFromMediaFlow({
        fileDataUri: input.fileDataUri,
      });
      textToProcess = extractionResult.extractedText;
    } else if (input.inputText) {
      textToProcess = input.inputText;
    }

    if (!textToProcess.trim()) {
      throw new Error(
        'Could not get any text to process from the input or file provided.'
      );
    }

    // Step 2: Simplify the text using the existing summarization flow
    const simplificationResult = await summarizeText({
      text: textToProcess,
      format: 'summary',
    });
    const simplifiedText = simplificationResult.simplifiedText;

    if (!simplifiedText) {
      throw new Error('Failed to generate text explanation.');
    }

    // Step 3: Convert the simplified text to speech
    const ttsResult = await textToSpeech({text: simplifiedText});

    return {
      simplifiedText,
      audioDataUri: ttsResult.audioDataUri,
    };
  }
);
