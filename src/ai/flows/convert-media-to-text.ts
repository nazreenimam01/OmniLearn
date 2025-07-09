'use server';
/**
 * @fileOverview A flow to convert audio or video media into simplified text.
 *
 * - convertMediaToText - A function that transcribes media and simplifies the text.
 * - ConvertMediaToTextInput - The input type for the function.
 * - ConvertMediaToTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConvertMediaToTextInputSchema = z.object({
  mediaDataUri: z
    .string()
    .describe(
      "Audio or video data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ConvertMediaToTextInput = z.infer<
  typeof ConvertMediaToTextInputSchema
>;

const ConvertMediaToTextOutputSchema = z.object({
  simplifiedText: z
    .string()
    .describe('The simplified transcript of the media.'),
});
export type ConvertMediaToTextOutput = z.infer<
  typeof ConvertMediaToTextOutputSchema
>;

export async function convertMediaToText(
  input: ConvertMediaToTextInput
): Promise<ConvertMediaToTextOutput> {
  return convertMediaToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'convertMediaToTextPrompt',
  input: {
    schema: z.object({
      mediaDataUri: z
        .string()
        .describe(
          "Audio or video data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    }),
  },
  output: {schema: ConvertMediaToTextOutputSchema},
  prompt: `You are an expert at transcribing audio and video and simplifying complex topics.
First, transcribe the following media file.
Media: {{media url=mediaDataUri}}

After transcribing, read the full transcript and then summarize it into a clear and easy-to-understand format.
The summary should capture the key points and main ideas of the media.

Output only the simplified summary.`,
});

const convertMediaToTextFlow = ai.defineFlow(
  {
    name: 'convertMediaToTextFlow',
    inputSchema: ConvertMediaToTextInputSchema,
    outputSchema: ConvertMediaToTextOutputSchema,
  },
  async input => {
    const {output} = await prompt({mediaDataUri: input.mediaDataUri});
    if (!output) {
      throw new Error(
        'The AI model failed to produce a valid transcript from the media.'
      );
    }
    return output;
  }
);
