import {SimplifyClient} from '@/components/simplify-client';

export default function SimplifyPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Text Simplification
        </h1>
        <p className="text-muted-foreground">
          Paste your text below and choose a format to simplify it.
        </p>
      </div>
      <SimplifyClient />
    </div>
  );
}
