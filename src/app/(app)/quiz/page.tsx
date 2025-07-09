import {QuizClient} from '@/components/quiz-client';

export default function QuizPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Quiz Generator
        </h1>
        <p className="text-muted-foreground">
          Provide a topic, paste some study material, or both, and generate a quiz to test your knowledge.
        </p>
      </div>
      <QuizClient />
    </div>
  );
}
