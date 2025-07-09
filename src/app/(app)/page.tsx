import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {BookText, Mic, ArrowRight, Combine, GraduationCap} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to OmniLearn
        </h1>
        <p className="text-muted-foreground">
          Your personal toolkit for enhanced learning and accessibility.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookText className="text-primary" />
              <span>Text Simplification</span>
            </CardTitle>
            <CardDescription>
              Summarize complex texts into simpler language or bullet points to
              improve understanding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Paste any text and let our AI provide a clear, concise version
              tailored to your needs. Perfect for dense articles, research
              papers, and lecture notes.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/simplify">
                Simplify Text <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="text-primary" />
              <span>Real-Time Transcription &amp; Speech Coach</span>
            </CardTitle>
            <CardDescription>
              Corrects grammatical errors and pronunciation, providing an
              improved transcript and audio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Record yourself speaking and receive an instant, corrected
              transcript. Listen to the generated audio to practice and improve
              your speech.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/transcribe">
                Start Coaching <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Combine className="text-primary" />
              <span>Multimedia Converter</span>
            </CardTitle>
            <CardDescription>
              Convert audio, video, images, PDFs, and text into simplified text and audio explanations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Upload your study materials—like lecture recordings, textbook pages, or even pasted text—and our AI will provide a clear, easy-to-understand explanation with an accompanying audio track.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/convert">
                Convert Media <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="text-primary" />
              <span>Quiz Generator</span>
            </CardTitle>
            <CardDescription>
              Create a quiz from any study material to test your knowledge and reinforce
              learning.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Paste your study material, give it a topic, and our AI will generate a
              multiple-choice quiz to help you check your understanding and
              prepare for exams.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/quiz">
                Create a Quiz <ArrowRight className="ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
