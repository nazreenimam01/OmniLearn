import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-text.ts';
import '@/ai/flows/real-time-transcription.ts';
import '@/ai/flows/convert-text-to-audio.ts';
import '@/ai/flows/generate-quiz.ts';
