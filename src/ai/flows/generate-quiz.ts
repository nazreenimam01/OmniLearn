'use server';
/**
 * @fileOverview A flow to generate a quiz from a given text or topic.
 *
 * - generateQuiz - A function that creates a 5-question multiple-choice quiz.
 * - GenerateQuizInput - The input type for the function.
 * - GenerateQuizOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizInputSchema = z
  .object({
    text: z.string().optional().describe('The source text for the quiz.'),
    topic: z.string().optional().describe('The topic for the quiz.'),
  })
  .refine(data => data.text || data.topic, {
    message: 'Either a topic or source text must be provided to generate a quiz.',
  });
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z
    .array(z.string())
    .length(4)
    .describe('An array of 4 possible answers.'),
  correctAnswer: z
    .string()
    .describe('The correct answer, which must be one of the strings in the options array.'),
});

const GenerateQuizOutputSchema = z.object({
  quiz: z
    .array(QuizQuestionSchema)
    .length(5)
    .describe('An array of 5 quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
  prompt: `You are an expert quiz creator. Your task is to generate a 5-question multiple-choice quiz.

{{#if topic}}
The quiz will be on the topic of: "{{{topic}}}"
{{/if}}

{{#if text}}
Use the following source text as the basis for the quiz. If no topic is provided, the quiz should be based solely on this text.
Source Text:
{{{text}}}
{{/if}}

The quiz must have exactly 5 questions.
Each question must have exactly 4 options.
One of the options must be the correct answer.
The 'correctAnswer' field in the output must be an exact match to one of the strings in the 'options' array.
The questions should test the understanding of the key concepts from the provided material.

Generate the 5-question quiz.`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output?.quiz || output.quiz.length !== 5) {
      throw new Error(
        'The AI model failed to generate a valid 5-question quiz.'
      );
    }
    return output;
  }
);
