import { Link } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import CopyAppLinkControl from './CopyAppLinkControl';
import { BookOpen, Library, Home, BarChart3, Menu } from 'lucide-react';
import { getReferralUtmContent } from '../utils/referral';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', icon: Home, label: 'Reviews' },
    { to: '/tracker', icon: Library, label: 'My Tracker' },
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-primary/10 backdrop-blur-sm sticky top-0 z-50 shadow-xs">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
                <span>Book Readers</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
                {navLinks.map(({ to, icon: Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    activeProps={{ className: 'text-primary font-semibold' }}
                    aria-label={`Navigate to ${label}`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <LoginButton />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
                    aria-label="Open navigation menu"
                    aria-expanded={mobileMenuOpen}
                  >
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64" aria-label="Mobile navigation menu">
                  <nav className="flex flex-col gap-4 mt-8" aria-label="Mobile navigation">
                    {navLinks.map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-base font-medium text-muted-foreground hover:text-foreground transition-colors p-2 rounded-md hover:bg-accent"
                        activeProps={{ className: 'text-primary bg-accent/50 font-semibold' }}
                        aria-label={`Navigate to ${label}`}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/50 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <p>© {new Date().getFullYear()} Book Readers. All rights reserved.</p>
              <CopyAppLinkControl />
            </div>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${getReferralUtmContent()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
