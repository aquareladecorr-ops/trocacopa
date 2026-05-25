'use client';

import { useState } from 'react';

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  className?: string;
}

export function ShareButton({
  url = 'https://www.trocacopa.com',
  title = 'TrocaCopa — Complete seu álbum trocando, não gastando!',
  text = 'Troque figurinhas com colecionadores perto de você. Grátis! 🏆',
  className = '',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    // Try native Web Share API (works on mobile & some desktop)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch {
        // User cancelled or API unavailable — fall through to copy
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Older browsers: execCommand fallback
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <button
      onClick={handleShare}
      aria-label="Compartilhar TrocaCopa"
      className={`inline-flex items-center gap-2 font-semibold px-5 py-3 rounded-xl border-2 border-green-600 text-green-700 hover:bg-green-50 transition-colors ${className}`}
    >
      {/* Share icon */}
      {!copied && !shared ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      <span>
        {shared ? 'Compartilhado!' : copied ? 'Link copiado!' : 'Compartilhar'}
      </span>
    </button>
  );
}
