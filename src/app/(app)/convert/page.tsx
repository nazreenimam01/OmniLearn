import {ConvertClient} from '@/components/convert-client';

export default function ConvertPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Multimedia Converter
        </h1>
        <p className="text-muted-foreground">
          Convert various files like audio, video, images, PDFs, or even just pasted text into a simplified explanation with audio.
        </p>
      </div>
      <ConvertClient />
    </div>
  );
}
