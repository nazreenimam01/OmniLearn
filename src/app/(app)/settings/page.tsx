import {SettingsClient} from '@/components/settings-client';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize the application to fit your needs.
        </p>
      </div>
      <SettingsClient />
    </div>
  );
}
