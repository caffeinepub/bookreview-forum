import React, { useEffect, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, loginError, isLoginError } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const disabled = loginStatus === 'logging-in' || loginStatus === 'initializing';

  // Display error messages
  useEffect(() => {
    if (isLoginError && loginError) {
      const message = loginError.message || 'Login failed';
      setErrorMessage(message);
      console.error('[LoginButton] Login error:', {
        message: loginError.message,
        name: loginError.name,
        cause: loginError.cause
      });
      
      // Clear error message after 10 seconds
      const timer = setTimeout(() => setErrorMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [isLoginError, loginError]);

  const handleAuth = async () => {
    setErrorMessage(null);
    
    if (isAuthenticated) {
      try {
        await clear();
        queryClient.clear();
        console.log('[LoginButton] Logged out successfully');
      } catch (error) {
        console.error('[LoginButton] Logout error:', error);
        setErrorMessage('Logout failed. Please try again.');
      }
    } else {
      try {
        console.log('[LoginButton] Starting login...');
        await login();
      } catch (error: any) {
        console.error('[LoginButton] Login error:', {
          message: error?.message,
          name: error?.name,
          error
        });
        
        // Handle specific error cases
        if (error?.message?.includes('already authenticated')) {
          console.log('[LoginButton] Stale auth detected, clearing and retrying...');
          await clear();
          setTimeout(() => {
            const retryLogin = async () => {
              try {
                await login();
                console.log('[LoginButton] Retry login succeeded');
              } catch (e) {
                console.error('[LoginButton] Retry login failed:', e);
                setErrorMessage('Login retry failed. Please refresh the page and try again.');
              }
            };
            void retryLogin();
          }, 500);
        } else if (error?.message?.toLowerCase().includes('popup')) {
          setErrorMessage('Login popup was blocked. Please allow popups for this site and try again.');
        } else {
          setErrorMessage(error?.message || 'Login failed. Please try again.');
        }
      }
    }
  };

  const getButtonText = () => {
    if (loginStatus === 'initializing') return 'Initializing...';
    if (loginStatus === 'logging-in') return 'Logging in...';
    return isAuthenticated ? 'Logout' : 'Login';
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleAuth}
        disabled={disabled}
        variant={isAuthenticated ? 'outline' : 'default'}
        size="default"
        className="font-medium"
      >
        {getButtonText()}
      </Button>
      
      {errorMessage && (
        <div className="flex items-start gap-2 max-w-xs text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-left">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
