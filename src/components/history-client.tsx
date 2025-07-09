'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Download } from 'lucide-react';
import { useHistory } from '@/hooks/use-history';
import { Skeleton } from './ui/skeleton';

export function HistoryClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const { history, loading } = useHistory(); // Use loading state

  const filteredHistory = useMemo(() => {
    if (!searchQuery) {
      return history;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return history.filter(
      (item) =>
        item.type.toLowerCase().includes(lowercasedQuery) ||
        item.content.toLowerCase().includes(lowercasedQuery) ||
        new Date(item.date)
          .toLocaleDateString()
          .toLowerCase()
          .includes(lowercasedQuery)
    );
  }, [searchQuery, history]);

  const downloadText = (content: string, filename: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderLoadingSkeleton = () => (
    <div className="flex flex-col gap-4 pr-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-1/4" />
            </div>
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-36" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by keyword, type, or date..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
      </div>
      <ScrollArea className="h-[60vh]">
        {loading ? (
          renderLoadingSkeleton()
        ) : filteredHistory.length > 0 ? (
          <div className="flex flex-col gap-4 pr-4">
            {filteredHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <CardTitle className="text-lg">{item.type}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      {new Date(item.date).toLocaleDateString()}
                    </Badge>
                  </div>
                  <CardDescription>
                    Generated on {new Date(item.date).toLocaleString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {item.content}
                  </p>
                  {item.audioUrl && (
                    <div className="mt-4">
                      <audio controls src={item.audioUrl} className="w-full">
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() =>
                      downloadText(item.content, `history-${item.id}.txt`)
                    }
                  >
                    <Download className="mr-2" />
                    Download Text
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex h-[40vh] items-center justify-center rounded-md border border-dashed">
            <p className="text-muted-foreground">
              Your history is empty. Generated content will appear here.
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
