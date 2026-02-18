import { useState, useRef, useEffect } from 'react';
import { useGetCallerUserProfile } from '../hooks/auth/useCallerUserProfile';
import { useSaveCallerUserProfile } from '../hooks/auth/useSaveCallerUserProfile';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Upload, X, User } from 'lucide-react';
import { validateImageFile, createPreviewUrl, revokePreviewUrl } from '../utils/uploadValidation';
import { ExternalBlob } from '../backend';
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        revokePreviewUrl(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error || 'Invalid image');
      setAvatarFile(null);
      if (avatarPreview) {
        revokePreviewUrl(avatarPreview);
        setAvatarPreview(null);
      }
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    if (avatarPreview) {
      revokePreviewUrl(avatarPreview);
    }
    setAvatarPreview(createPreviewUrl(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarError(null);
    if (avatarPreview) {
      revokePreviewUrl(avatarPreview);
      setAvatarPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let avatarBlob: ExternalBlob | undefined = undefined;
    if (avatarFile) {
      const bytes = new Uint8Array(await avatarFile.arrayBuffer());
      avatarBlob = ExternalBlob.fromBytes(bytes);
    }

    saveProfile({
      name: name.trim(),
      avatar: avatarBlob,
    });
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Welcome to Book Readers!</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please tell us your name to get started. You can also add a profile picture.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Profile Picture (optional)</label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-muted text-muted-foreground rounded-md cursor-pointer hover:bg-muted/80 transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </label>
                <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or WebP (max 2MB)</p>
              </div>
            </div>
            {avatarError && <p className="text-sm text-destructive mt-2">{avatarError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Your Name *</label>
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
