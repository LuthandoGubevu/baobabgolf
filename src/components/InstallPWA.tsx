'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const InstallPWA = () => {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    // The type assertion is needed because the base Event type doesn't have prompt()
    (installPrompt as any).prompt();
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <div className="w-full">
      <Button variant="outline" className="w-full" onClick={handleInstallClick}>
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>
    </div>
  );
};

export default InstallPWA;
