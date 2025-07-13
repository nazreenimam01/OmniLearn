'use client';

import React, { useState, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Download, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FormatType = 'summary' | 'bullet points';

export function SimplifyClient() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [format, setFormat] = useState<FormatType>('summary');
  const [result, setResult] = useState<string | null>(null);

  const getDemoSummary = (input: string, format: FormatType) => {
    if (!input.trim()) return '';
    if (format === 'bullet points') {
      return `• Simplified point one from demo text.\n• Simplified point two.\n• Another clear bullet.`;
    }
    return 'This is a simplified summary of your input (static demo).';
  };

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

    startTransition(() => {
      setResult(null);
      const simplifiedText = getDemoSummary(text, format);
      setResult(simplifiedText);
    });
  };

  const downloadText = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
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
              onValueChange={value => setFormat(value as FormatType)}
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
