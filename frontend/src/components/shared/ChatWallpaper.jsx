import React from 'react';

export function ChatWallpaper() {
  return (
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none z-0 overflow-hidden">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="chat-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M10 10l5 5m-5 0l5-5m10 20l5 5m-5 0l5-5M50 50l5 5m-5 0l5-5M80 20l5 5m-5 0l5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <circle cx="30" cy="70" r="2" fill="currentColor" />
            <circle cx="70" cy="30" r="1.5" fill="currentColor" />
            <path d="M40 10h4v4h-4zM90 60h3v3h-3z" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chat-pattern)" />
      </svg>
    </div>
  );
}
