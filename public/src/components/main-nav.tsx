'use client';

import React from 'react';
import {usePathname} from 'next/navigation';
import {
  Home,
  BookText,
  Mic,
  Settings,
  Combine,
  GraduationCap,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function MainNav() {
  const pathname = usePathname();

  const menuItems = [
    {href: '/', label: 'Home', icon: Home},
    {href: '/simplify', label: 'Simplify Text', icon: BookText},
    {href: '/transcribe', label: 'Transcribe Speech', icon: Mic},
    {href: '/convert', label: 'Multimedia Converter', icon: Combine},
    {href: '/quiz', label: 'Quiz Generator', icon: GraduationCap},
    {href: '/settings', label: 'Settings', icon: Settings},
  ];

  return (
    <SidebarMenu>
      {menuItems.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <a href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
