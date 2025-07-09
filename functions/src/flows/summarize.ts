import { defineFlow } from '@genkit-ai/core';
import generateText from '@genkit-ai/googleai';
import { z } from 'zod';

export const summarizeText = defineFlow({
  name: 'summarizeText',
  inputSchema: z.object({
    text: z.string()
  }),
  outputSchema: z.string(),
  run: async ({ text }) => {
    const result = await generateText({
      model: 'models/text-bison-001',
      prompt: `Summarize this:\n\n${text}`
    });

    return result.text;
  }
});



