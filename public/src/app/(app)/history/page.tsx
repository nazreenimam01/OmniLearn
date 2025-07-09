import {HistoryClient} from '@/components/history-client';

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
        <p className="text-muted-foreground">
          Review, search, and manage your generated content from this session.
        </p>
      </div>
      <HistoryClient />
    </div>
  );
}
