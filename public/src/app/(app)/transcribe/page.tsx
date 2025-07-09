import {TranscriptionClient} from '@/components/transcription-client';

export default function TranscribePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Real-Time Transcription & Speech Coach
        </h1>
        <p className="text-muted-foreground">
          Record your voice to get an instant, corrected transcript and audio to help improve your speech.
        </p>
      </div>
      <TranscriptionClient />
    </div>
  );
}
