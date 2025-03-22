import React from 'react';
import { Link } from 'wouter';
import { FileText, User, SunMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            AI Scriptwriting Agent
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button variant="ghost" size="sm">
              <SunMoon className="w-5 h-5" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* User Menu */}
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <span className="sr-only md:not-sr-only">Account</span>
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Scriptwriting Agent. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Help</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
