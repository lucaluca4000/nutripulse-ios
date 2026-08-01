export const APP_VERSION = '1.3.0';

export interface VersionInfo {
  version: string;
  releaseDate: string;
  appName: string;
  notes: string[];
  downloadApkUrl?: string;
  downloadIosUrl?: string;
}

/**
  * Compares two semantic version strings (e.g. '1.3.0' vs '1.2.0').
  * Returns true if serverVersion is strictly newer than currentVersion.
  */
export function isNewerVersionAvailable(serverVersion: string, currentVersion: string = APP_VERSION): boolean {
  if (!serverVersion) return false;
  
  const parse = (v: string) => v.split('.').map((p) => parseInt(p, 10) || 0);
  const sParts = parse(serverVersion);
  const cParts = parse(currentVersion);

  for (let i = 0; i < Math.max(sParts.length, cParts.length); i++) {
    const s = sParts[i] || 0;
    const c = cParts[i] || 0;
    if (s > c) return true;
    if (s < c) return false;
  }
  return false;
}

/**
  * Fetches latest version metadata from the backend /api/version
  */
export async function fetchServerVersionInfo(): Promise<VersionInfo | null> {
  try {
    const response = await fetch('/api/version?t=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data as VersionInfo;
  } catch (error) {
    console.error('Failed to check for app updates:', error);
    return null;
  }
}

/**
  * Performs 1-click update by clearing PWA cache and reloading
  */
export async function performOneClickUpdate(): Promise<void> {
  try {
    // 1. Clear Service Worker Caches if available
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    // 2. Unregister active service workers to force immediate fresh fetch
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }
  } catch (err) {
    console.warn('Error clearing cache during update:', err);
  } finally {
    // 3. Force hard reload from server
    window.location.reload();
  }
}
