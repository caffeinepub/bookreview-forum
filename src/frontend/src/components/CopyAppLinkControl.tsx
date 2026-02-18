import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { getAppOrigin } from '../utils/appLink';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

export default function CopyAppLinkControl() {
  const [copied, setCopied] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const appUrl = getAppOrigin();

  const handleCopy = async () => {
    if (!appUrl) {
      setShowFallback(true);
      return;
    }

    // Try to use the Clipboard API
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(appUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        // Clipboard API failed, show fallback
        setShowFallback(true);
      }
    } else {
      // Clipboard API not available, show fallback
      setShowFallback(true);
    }
  };

  const handleFallbackClose = () => {
    setShowFallback(false);
  };

  const handleSelectAll = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="gap-2 text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy app link
          </>
        )}
      </Button>

      <Dialog open={showFallback} onOpenChange={setShowFallback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy app link</DialogTitle>
            <DialogDescription>
              Select and copy the link below:
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <input
              type="text"
              readOnly
              value={appUrl || 'URL not available'}
              onClick={handleSelectAll}
              className="w-full px-3 py-2 border border-border rounded-md bg-muted text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleFallbackClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
