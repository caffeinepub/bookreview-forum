import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/auth/useCallerUserProfile';
import { useSaveCallerUserProfile } from '../hooks/auth/useSaveCallerUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSaving } = useSaveCallerUserProfile();
  const [name, setName] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile({ name: name.trim() });
    }
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Welcome to BookReviews!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please tell us your name to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
