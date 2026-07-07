import type { ApiConfig } from '@/types';

const STORAGE_KEY = 'sns-competitor-api-config';

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://sns-competitor-backend.onrender.com',
  apiKey: '',
  useMock: false,
};

export function getConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) as Partial<ApiConfig> };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: ApiConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
