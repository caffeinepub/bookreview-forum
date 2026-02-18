import { Link } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import CopyAppLinkControl from './CopyAppLinkControl';
import { BookOpen, Library, Home, BarChart3, Menu, User } from 'lucide-react';
import { getReferralUtmContent } from '../utils/referral';
import { getBuildIdentifier } from '../utils/buildInfo';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/auth/useCallerUserProfile';
import { useExternalBlobImageUrl } from '../hooks/useExternalBlobImageUrl';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const avatarUrl = useExternalBlobImageUrl(userProfile?.avatar);

  const isAuthenticated = !!identity;

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
            <div className="flex items-center gap-3">
              {isAuthenticated && userProfile && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">{userProfile.name}</span>
                </div>
              )}
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
                  {isAuthenticated && userProfile && (
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={userProfile.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-border">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{userProfile.name}</p>
                        <p className="text-xs text-muted-foreground">Signed in</p>
                      </div>
                    </div>
                  )}
                  <nav className="flex flex-col gap-4" aria-label="Mobile navigation">
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
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
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
              <span className="hidden md:inline text-muted-foreground/50">•</span>
              <p className="text-xs text-muted-foreground/70 font-mono" title="Build identifier for verification">
                {getBuildIdentifier()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
