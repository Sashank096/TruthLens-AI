// TruthLens Centralized API & Forensic Engine Client

export const getApiBaseUrl = (): string => {
  const custom = localStorage.getItem('truthlens_api_base_url');
  if (custom !== null) {
    return custom.trim().replace(/\/$/, '');
  }
  // Check Vite env
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
};

export const setApiBaseUrl = (url: string): void => {
  if (!url || url.trim() === '') {
    localStorage.removeItem('truthlens_api_base_url');
  } else {
    localStorage.setItem('truthlens_api_base_url', url.trim().replace(/\/$/, ''));
  }
};

export const resolveAssetUrl = (relPath: string | null | undefined): string => {
  if (!relPath) return '';
  if (relPath.startsWith('http://') || relPath.startsWith('https://') || relPath.startsWith('data:')) {
    return relPath;
  }
  const base = getApiBaseUrl();
  const cleanPath = relPath.startsWith('/') ? relPath : `/${relPath}`;
  return `${base}${cleanPath}`;
};

export const checkBackendHealth = async (): Promise<{ online: boolean; latencyMs?: number; modules?: any }> => {
  const base = getApiBaseUrl();
  const startTime = performance.now();
  try {
    const res = await fetch(`${base}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - startTime);
      return { online: true, latencyMs, modules: data.modules };
    }
    return { online: false };
  } catch (err) {
    return { online: false };
  }
};
