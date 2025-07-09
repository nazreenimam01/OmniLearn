'use client';

import React, {useState, useTransition} from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Loader2, Download, FileText, Sparkles} from 'lucide-react';
import {summarizeText} from '@/ai/flows/summarize-text';
import type {SummarizeTextInput} from '@/ai/flows/summarize-text';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from './ui/alert';

export function SimplifyClient() {
  const [isPending, startTransition] = useTransition();
  const {toast} = useToast();
  const [text, setText] = useState('');
  const [format, setFormat] =
    useState<SummarizeTextInput['format']>('summary');
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter some text to simplify.',
      });
      return;
    }

    startTransition(async () => {
      setResult(null);
      try {
        const {simplifiedText} = await summarizeText({text, format});
        setResult(simplifiedText);
      } catch (error) {
        console.error('Simplification failed:', error);
        let description = 'An unexpected error occurred. Please try again.';
        if (error instanceof Error) {
            if (/quota|429/i.test(error.message)) {
                description =
                    'You have exceeded the free usage limit for this feature. Please check your plan and billing details.';
            } else if (/failed to|could not/i.test(error.message)) {
                description = 'The AI model could not process your request. Please try modifying your input or try again later.';
            }
        }
        toast({
          variant: 'destructive',
          title: 'Simplification Failed',
          description,
        });
      }
    });
  };

  const downloadText = () => {
    if (!result) return;
    const blob = new Blob([result], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simplified-text-${format}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText />
              <span>Original Text</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your complex text here..."
              value={text}
              onChange={e => setText(e.target.value)}
              className="min-h-[200px] resize-y"
              aria-label="Original Text"
            />
            <RadioGroup
              value={format}
              onValueChange={value =>
                setFormat(value as SummarizeTextInput['format'])
              }
              className="flex items-center gap-4"
            >
              <Label className="font-normal">Format:</Label>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="summary" id="summary" />
                <Label htmlFor="summary">Summary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bullet points" id="bullet-points" />
                <Label htmlFor="bullet-points">Bullet Points</Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending || !text}>
              {isPending && <Loader2 className="mr-2 animate-spin" />}
              Simplify
            </Button>
          </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <span>Simplified Result</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="min-h-[232px]">
          {isPending && (
            <div className="flex h-full min-h-[150px] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {result && (
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
              {result}
            </div>
          )}
          {!isPending && !result && (
            <div className="flex h-full min-h-[150px] items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground">
                Your simplified text will appear here.
              </p>
            </div>
          )}
        </CardContent>
        {result && (
          <CardFooter>
            <Button variant="outline" onClick={downloadText}>
              <Download className="mr-2" />
              Download
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
