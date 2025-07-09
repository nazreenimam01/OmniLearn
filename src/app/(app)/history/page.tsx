export const dynamic = "force-dynamic";

import { HistoryProvider } from '@/contexts/HistoryContext';


import { HistoryClient } from "@/components/history-client";


export default function HistoryPage() {
  return (
    <HistoryProvider>
      <HistoryClient />
    </HistoryProvider>
  );
}