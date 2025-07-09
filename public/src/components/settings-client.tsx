'use client';

import React, {useEffect, useState} from 'react';
import {useTheme} from 'next-themes';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Skeleton} from './ui/skeleton';

export function SettingsClient() {
  const {theme, setTheme} = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex flex-col gap-1">
              <span>Dark Mode</span>
              <span className="text-xs font-normal text-muted-foreground">
                Enable to switch to a dark color scheme.
              </span>
            </Label>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
              aria-label="Toggle dark mode"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
