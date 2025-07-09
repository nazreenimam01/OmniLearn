import React from 'react';
import Link from 'next/link';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {MainNav} from '@/components/main-nav';
import {Logo} from '@/components/icons';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

export default function AppLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">OmniLearn</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage
                src="https://placehold.co/32x32.png"
                alt="User Avatar"
                data-ai-hint="user avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Student User</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-6 text-primary" />
            <h1 className="text-lg font-semibold">OmniLearn</h1>
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
