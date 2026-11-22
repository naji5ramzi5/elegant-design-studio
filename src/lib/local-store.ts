import { useSyncExternalStore } from "react";

type Listener = () => void;

/** Tiny persisted store; SSR renders the empty initial value, the browser hydrates from localStorage. */
export function createPersistedStore<T>(key: string, initial: T) {
  let state: T = initial;
  let loaded = false;
  const listeners = new Set<Listener>();

  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = JSON.parse(raw) as T;
    } catch {
      /* ignore corrupt storage */
    }
  };

  const set = (updater: (prev: T) => T) => {
    load();
    state = updater(state);
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (l: Listener) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        loaded = false;
        load();
        listeners.forEach((fn) => fn());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  };

  const getSnapshot = () => {
    load();
    return state;
  };

  const useStore = () => useSyncExternalStore(subscribe, getSnapshot, () => initial);

  return { useStore, set, get: getSnapshot };
}
