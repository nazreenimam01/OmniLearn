'use client';

import React, {useState, useRef, useTransition} from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {
  Loader2,
  Download,
  Mic,
  Square,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';
import {realTimeTranscription} from '@/ai/flows/real-time-transcription';
import {summarizeText} from '@/ai/flows/summarize-text';
import {Alert, AlertDescription, AlertTitle} from './ui/alert';
import {Label} from '@/components/ui/label';

type Status = 'idle' | 'recording' | 'processing' | 'error' | 'success';
type ContentType = 'transcript' | 'explanation';

export function TranscriptionClient() {
  const {toast} = useToast();
  const [isTranscriptionPending, startTranscriptionTransition] = useTransition();
  const [isExplanationPending, startExplanationTransition] = useTransition();
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<ContentType>('transcript');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    setError(null);
    setTranscript('');
    setAudioDataUri(null);
    setContentType('transcript');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = event => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        setStatus('processing');
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          startTranscriptionTransition(async () => {
            try {
              const result = await realTimeTranscription({
                audioDataUri: base64Audio,
              });
              setTranscript(result.transcript);
              setAudioDataUri(result.audioDataUri);
              setStatus('success');
              setContentType('transcript');
            } catch (err) {
              console.error('Transcription failed:', err);
              let description = 'An unexpected error occurred. Please try again.';
              if (err instanceof Error) {
                if (/quota|429/i.test(err.message)) {
                    description = 'You have exceeded the free usage limit for this feature. Please check your plan and billing details.';
                } else if (/failed to|could not/i.test(err.message)) {
                    description = 'The AI model could not process your request. Please try modifying your input or try again later.';
                }
              }
              setError(description);
              setStatus('error');
              toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description,
              });
            }
          });
        };
      };

      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(
        'Microphone access denied. Please allow microphone access in your browser settings.'
      );
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      // onstop will handle the state change
    }
  };

  const handleGenerateExplanation = () => {
    if (!transcript) return;

    startExplanationTransition(async () => {
      setAudioDataUri(null);
      try {
        const result = await summarizeText({
          text: transcript,
          format: 'summary',
        });
        const explanationText = result.simplifiedText;
        setTranscript(explanationText);
        setContentType('explanation');
        toast({
          title: 'Explanation Generated',
          description: 'The transcript has been simplified.',
        });
      } catch (err) {
        console.error('Explanation failed:', err);
        let description = 'An unexpected error occurred. Please try again.';
        if (err instanceof Error) {
            if (/quota|429/i.test(err.message)) {
                description = 'You have exceeded the free usage limit for this feature. Please check your plan and billing details.';
            } else if (/failed to|could not/i.test(err.message)) {
                description = 'The AI model could not process your request. Please try modifying your input or try again later.';
            }
        }
        toast({
          variant: 'destructive',
          title: 'Explanation Failed',
          description,
        });
      }
    });
  };

  const downloadText = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isProcessing = status === 'processing' || isTranscriptionPending;
  const isBusy = isProcessing || isExplanationPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic />
          <span>Recorder</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/50 p-8">
          {status === 'recording' ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopRecording}
              className="h-16 w-16 rounded-full"
              aria-label="Stop recording"
            >
              <Square className="h-8 w-8 fill-current" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isBusy}
              className="h-16 w-16 rounded-full"
              aria-label="Start recording"
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          )}
          <p className="text-sm font-medium text-muted-foreground">
            {isProcessing && 'Processing your audio...'}
            {status === 'recording' && 'Recording... Click to stop.'}
            {status === 'idle' && 'Click the button to start recording.'}
            {status === 'success' && 'Transcription successful!'}
            {status === 'error' && 'An error occurred.'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transcript">
              {contentType === 'transcript'
                ? 'Corrected Transcript'
                : 'Simplified Explanation'}
            </Label>
            <Textarea
              id="transcript"
              placeholder={
                contentType === 'transcript'
                  ? 'Your corrected transcript will appear here...'
                  : 'Your simplified explanation will appear here...'
              }
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              className="mt-2 min-h-[150px] resize-y"
              readOnly={isBusy}
            />
          </div>

          {audioDataUri && (
            <div className="space-y-2">
              <Label>
                {contentType === 'transcript'
                  ? 'Corrected Audio'
                  : 'Explanation Audio'}
              </Label>
              <audio controls src={audioDataUri} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          onClick={downloadText}
          disabled={!transcript || isBusy}
          variant="outline"
        >
          <Download className="mr-2" />
          Download{' '}
          {contentType === 'transcript' ? 'Transcript' : 'Explanation'}
        </Button>
        {transcript && contentType === 'transcript' && (
          <Button onClick={handleGenerateExplanation} disabled={isBusy}>
            {isExplanationPending ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <Sparkles className="mr-2" />
            )}
            Generate Explanation
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
