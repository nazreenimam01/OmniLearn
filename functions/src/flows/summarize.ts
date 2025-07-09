import {defineFlow} from "@genkit-ai/core";
import {z} from "zod";
import {googleAI} from "@genkit-ai/googleai";

const model = googleAI().models.text("models/text-bison-001");

export const summarizeText = defineFlow(
  {
    name: "summarizeText",
    inputSchema: z.object({
      text: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({text}) => {
    const result = await model.generateContent({
      prompt: `Summarize the following:\n\n${text}`,
    });
    return result.text(); // <- Use result.text() to extract text
  }
);


