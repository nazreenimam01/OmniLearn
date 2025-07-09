'use server';

/**
 * @fileOverview Real-time transcription flow for converting speech to editable text.
 *
 * - realTimeTranscription - A function that handles the real-time transcription process.
 * - RealTimeTranscriptionInput - The input type for the realTimeTranscription function.
 * - RealTimeTranscriptionOutput - The return type for the realTimeTranscription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {textToSpeech} from '@/ai/flows/convert-text-to-audio';

const RealTimeTranscriptionInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "Audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  formattingPreferences: z
    .string()
    .optional()
    .describe('Optional formatting preferences for the transcription.'),
});
export type RealTimeTranscriptionInput = z.infer<
  typeof RealTimeTranscriptionInputSchema
>;

const RealTimeTranscriptionOutputSchema = z.object({
  transcript: z
    .string()
    .describe('The corrected and polished transcript from the audio data.'),
  audioDataUri: z
    .string()
    .describe('The generated audio of the corrected transcript as a data URI.'),
});
export type RealTimeTranscriptionOutput = z.infer<
  typeof RealTimeTranscriptionOutputSchema
>;

export async function realTimeTranscription(
  input: RealTimeTranscriptionInput
): Promise<RealTimeTranscriptionOutput> {
  return realTimeTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'realTimeTranscriptionPrompt',
  input: {schema: RealTimeTranscriptionInputSchema},
  output: {
    schema: z.object({
      transcript: z
        .string()
        .describe('The corrected and polished transcript from the audio data.'),
    }),
  },
  prompt: `You are an expert transcriptionist specializing in assisting users who may have speech impediments, such as stuttering, or make pronunciation and grammatical errors.
Your task is to transcribe the following audio, but with a crucial difference: you must correct any mistakes to produce a clean, fluent, and grammatically correct text.

- Correct any stuttering or repeated words.
- Fix any spelling mistakes that result from mispronunciations.
- Correct any grammatical errors.
- The final output should be a polished version of what the user intended to say.

Audio: {{media url=audioDataUri}}

{{#if formattingPreferences}}
Formatting Preferences: {{{formattingPreferences}}}
{{/if}}

Please provide the corrected and polished transcribed text.`,
});

const realTimeTranscriptionFlow = ai.defineFlow(
  {
    name: 'realTimeTranscriptionFlow',
    inputSchema: RealTimeTranscriptionInputSchema,
    outputSchema: RealTimeTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output?.transcript) {
      throw new Error('Failed to generate transcript from audio.');
    }

    const {audioDataUri} = await textToSpeech({text: output.transcript});

    return {
      transcript: output.transcript,
      audioDataUri,
    };
  }
);