"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useVisitorTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages or login page
    if (pathname.startsWith('/admin') || pathname === '/login') {
      return;
    }

    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('visitor_session');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('visitor_session', sessionId);
    }

    // Track the visit
    fetch('/api/visitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: pathname,
        sessionId: sessionId,
      }),
    }).catch(console.error);
  }, [pathname]);
}

