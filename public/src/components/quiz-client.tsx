'use client';

import React, {useState, useTransition} from 'react';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Input} from '@/components/ui/input';
import {useToast} from '@/hooks/use-toast';
import {
  Loader2,
  FileText,
  Wand,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {generateQuiz} from '@/ai/flows/generate-quiz';
import type {GenerateQuizOutput} from '@/ai/flows/generate-quiz';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import {Alert, AlertTitle, AlertDescription} from '@/components/ui/alert';

type QuizQuestion = GenerateQuizOutput['quiz'][0];

export function QuizClient() {
  const {toast} = useToast();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleGenerateQuiz = () => {
    if (!topic.trim() && !text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide a topic or some study material to generate a quiz.',
      });
      return;
    }

    startTransition(async () => {
      // We don't reset the whole state here anymore, just the quiz part
      setQuiz(null);
      setAnswers({});
      setShowScore(false);
      setScore(0);
      setCurrentQuestionIndex(0);

      try {
        const result = await generateQuiz({text, topic});
        if (result.quiz && result.quiz.length > 0) {
          setQuiz(result.quiz);
        } else {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not generate a quiz from the provided text.',
          });
        }
      } catch (error) {
        console.error('Quiz generation failed:', error);
        let description = 'An unexpected error occurred. Please try again.';
        if (error instanceof Error) {
          if (/quota|429/i.test(error.message)) {
            description =
              'You have exceeded the free usage limit for this feature. Please check your plan and billing details.';
          } else if (/failed to|could not/i.test(error.message)) {
            description =
              'The AI model could not process your request. Please try modifying your input or try again later.';
          }
        }
        toast({
          variant: 'destructive',
          title: 'Quiz Generation Failed',
          description,
        });
      }
    });
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({...prev, [currentQuestionIndex]: value}));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quiz?.length ?? 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateScore();
      setShowScore(true);
    }
  };

  const calculateScore = () => {
    if (!quiz) return;
    let correctAnswers = 0;
    quiz.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  const resetQuizState = () => {
    setQuiz(null);
    setAnswers({});
    setShowScore(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setText('');
    setTopic('');
  };

  const currentQuestion = quiz?.[currentQuestionIndex];
  const isAnswerSelected = answers[currentQuestionIndex] !== undefined;

  return (
    <Card>
      <CardHeader>
        {isPending ? (
          <>
            <CardTitle>Generating Quiz</CardTitle>
            <CardDescription>
              Please wait while we create your quiz...
            </CardDescription>
          </>
        ) : showScore && quiz ? (
          <>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>
              You scored {score} out of {quiz.length}!
            </CardDescription>
          </>
        ) : quiz && currentQuestion ? (
          <>
            <CardTitle>
              Question {currentQuestionIndex + 1} of {quiz.length}
            </CardTitle>
            <CardDescription>{currentQuestion.question}</CardDescription>
          </>
        ) : (
          <>
            <CardTitle className="flex items-center gap-2">
              <FileText /> <span>Source Content</span>
            </CardTitle>
            <CardDescription>
              Provide a topic, paste some study material, or both to create your quiz.
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="min-h-[350px]">
        {isPending ? (
          <div className="flex h-full min-h-[300px] items-center justify-center">
            <Loader2 className="size-12 animate-spin text-primary" />
          </div>
        ) : showScore && quiz ? (
          <div className="space-y-4">
            <Progress value={(score / quiz.length) * 100} className="w-full" />
            <div className="max-h-80 space-y-4 overflow-y-auto pr-2">
              {quiz.map((q, index) => (
                <Alert
                  key={index}
                  variant={
                    answers[index] === q.correctAnswer
                      ? 'default'
                      : 'destructive'
                  }
                  className="bg-muted/50"
                >
                  <div className="flex items-start gap-2">
                    {answers[index] === q.correctAnswer ? (
                      <CheckCircle className="mt-1 size-4 text-green-500" />
                    ) : (
                      <XCircle className="mt-1 size-4 text-red-500" />
                    )}
                    <div>
                      <AlertTitle className="font-semibold">
                        {q.question}
                      </AlertTitle>
                      <AlertDescription>
                        Your answer: {answers[index] ?? 'Not answered'}
                        <br />
                        <span className="font-medium text-foreground">
                          Correct answer: {q.correctAnswer}
                        </span>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        ) : quiz && currentQuestion ? (
          <RadioGroup
            value={answers[currentQuestionIndex]}
            onValueChange={handleAnswerChange}
            className="space-y-2"
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`q${currentQuestionIndex}-o${index}`}
                />
                <Label htmlFor={`q${currentQuestionIndex}-o${index}`}>
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-input">Topic</Label>
              <Input
                id="topic-input"
                type="text"
                placeholder="e.g., The American Revolution"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="study-material-input">Study Material</Label>
              <Textarea
                id="study-material-input"
                placeholder="Paste your learning material here..."
                value={text}
                onChange={e => setText(e.target.value)}
                className="min-h-[250px] resize-y"
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex">
        {isPending ? null : showScore && quiz ? (
          <Button onClick={resetQuizState}>
            <RefreshCw className="mr-2" />
            Start New Quiz
          </Button>
        ) : quiz && currentQuestion ? (
          <div className="flex w-full items-center justify-between">
            <Progress
              value={((currentQuestionIndex + 1) / quiz.length) * 100}
              className="w-1/3"
            />
            <Button onClick={handleNextQuestion} disabled={!isAnswerSelected}>
              {currentQuestionIndex < quiz.length - 1
                ? 'Next Question'
                : 'Finish Quiz'}
            </Button>
          </div>
        ) : (
          <Button onClick={handleGenerateQuiz} disabled={!topic.trim() && !text.trim()}>
            <Wand className="mr-2" />
            Generate Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
