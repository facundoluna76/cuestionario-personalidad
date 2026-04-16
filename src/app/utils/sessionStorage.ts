export interface SavedSession {
  id: string;
  name: string;
  age: string;
  savedAt: string; // ISO string
  currentPage: number;
  answers: Record<number, string>;
}

const STORAGE_KEY = "cuestionario_sessions";

export function getSavedSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function upsertSession(
  session: Omit<SavedSession, "savedAt"> & { id: string }
): SavedSession {
  const sessions = getSavedSessions();
  const now = new Date().toISOString();
  const updated: SavedSession = { ...session, savedAt: now };
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = updated;
  } else {
    sessions.push(updated);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  return updated;
}

export function deleteSession(id: string): void {
  const remaining = getSavedSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
