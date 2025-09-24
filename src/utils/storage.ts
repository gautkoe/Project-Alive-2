export function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined';
}

export function safeGetItem(key: string): string | null {
  if (!isBrowserEnvironment()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage`, error);
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  if (!isBrowserEnvironment()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to write ${key} to localStorage`, error);
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  if (!isBrowserEnvironment()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Unable to remove ${key} from localStorage`, error);
  }
}
