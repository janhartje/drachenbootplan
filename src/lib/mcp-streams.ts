
import { type ReadableStreamDefaultController } from 'stream/web';
import { PostgresSessionStore } from './mcp/postgres-session-store';

const sessionStore = new PostgresSessionStore();

export interface McpSession {
  id: string;
  controller: ReadableStreamDefaultController;
  apiKey: string;
  createdAt: number;
  isActive: boolean;
}

interface PendingMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

interface PendingQueue {
  messages: PendingMessage[];
  lastUpdated: number;
}

// Global store for active sessions (in-memory)
const activeSessions = new Map<string, McpSession>();

// Buffer for messages when session is not ready (prevents data loss)
const pendingMessages = new Map<string, PendingQueue>();
const MAX_PENDING_MSGS = 100;
const PENDING_TTL_MS = 60000; // 1 minute keep-alive for pending messages

// Promises waiting for a session to be established (keyed by API key)
const sessionWaiters = new Map<string, Array<(session: McpSession) => void>>();

// Cleanup interval for pending messages to prevent memory leaks
let cleanupInterval: NodeJS.Timeout | null = null;

function ensureCleanupRunning() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, queue] of pendingMessages.entries()) {
      if (now - queue.lastUpdated > PENDING_TTL_MS) {
        pendingMessages.delete(key);
      }
    }
    // Stop interval if empty to save resources
    if (pendingMessages.size === 0) {
      clearInterval(cleanupInterval!);
      cleanupInterval = null;
    }
  }, 30000);
}

export async function createSession(id: string, controller: ReadableStreamDefaultController, apiKey: string) {
  // Persist to DB first
  await sessionStore.createSession(id, apiKey);

  // Clean up any existing sessions for this API key (in memory and potentially DB)
  for (const [, session] of activeSessions.entries()) {
    if (session.apiKey === apiKey) {
      session.isActive = false;
      activeSessions.delete(session.id);
      // We also try to remove from DB for consistency, though it might fail if already gone
      sessionStore.removeSession(session.id).catch(() => { });
    }
  }

  const newSession: McpSession = { id, controller, apiKey, createdAt: Date.now(), isActive: true };
  activeSessions.set(id, newSession);

  // Replay pending messages immediately
  const pending = pendingMessages.get(apiKey);
  if (pending) {
    for (const msg of pending.messages) {
      sendSseEvent(controller, msg.event, msg.data);
    }
    pendingMessages.delete(apiKey);
  }

  // Resolve any waiters for this API key
  const waiters = sessionWaiters.get(apiKey);
  if (waiters) {
    for (const resolve of waiters) {
      resolve(newSession);
    }
    sessionWaiters.delete(apiKey);
  }
}

export async function getSession(id: string) {
  const session = activeSessions.get(id);

  if (!session || !session.isActive) {
    return undefined;
  }

  // Validate against DB (1 DB query per message check)
  const dbSession = await sessionStore.getSession(id);
  if (!dbSession) {
    // Session exists in memory but not in DB -> Force close/remove
    session.isActive = false;
    activeSessions.delete(id);
    return undefined;
  }

  return session;
}

export async function getSessionByApiKey(apiKey: string) {
  // Find the most recent ACTIVE session for this API key in memory
  let latestSession: McpSession | undefined;

  for (const session of activeSessions.values()) {
    if (session.apiKey === apiKey && session.isActive) {
      if (!latestSession || session.createdAt > latestSession.createdAt) {
        latestSession = session;
      }
    }
  }

  if (!latestSession) {
    return undefined;
  }

  // Validate existence in DB
  const dbSession = await sessionStore.getSession(latestSession.id);
  if (!dbSession) {
    activeSessions.delete(latestSession.id);
    return undefined;
  }

  return latestSession;
}

/**
 * Wait for a session to be established for the given API key.
 * Returns the session if it already exists, or waits up to timeoutMs for one to be created.
 */
export async function waitForSession(apiKey: string, timeoutMs: number = 5000): Promise<McpSession | null> {
  // Check if session already exists
  const existing = await getSessionByApiKey(apiKey);
  if (existing) {
    return existing;
  }

  // Wait for session to be created
  return new Promise((resolve) => {
    const waiters = sessionWaiters.get(apiKey) || [];
    waiters.push(resolve);
    sessionWaiters.set(apiKey, waiters);

    // Timeout after specified duration
    setTimeout(async () => {
      const currentWaiters = sessionWaiters.get(apiKey);
      if (currentWaiters) {
        const index = currentWaiters.indexOf(resolve);
        if (index !== -1) {
          currentWaiters.splice(index, 1);
          if (currentWaiters.length === 0) {
            sessionWaiters.delete(apiKey);
          }
        }
      }
      // Check one more time if session was created
      const session = await getSessionByApiKey(apiKey);
      resolve(session ?? null);
    }, timeoutMs);
  });
}

export async function removeSession(id: string) {
  const session = activeSessions.get(id);
  if (session) {
    session.isActive = false;
  }
  activeSessions.delete(id);

  await sessionStore.removeSession(id);
}

export function sendSseEvent(controller: ReadableStreamDefaultController, event: string, data: unknown): boolean {
  try {
    const encoder = new TextEncoder();
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const text = `event: ${event}\ndata: ${dataString}\n\n`;
    controller.enqueue(encoder.encode(text));
    return true;
  } catch (err) {
    // Handle ResponseAborted and other stream errors gracefully
    const errorName = err instanceof Error ? err.name : 'Unknown';
    if (errorName !== 'ResponseAborted') {
      console.error('[MCP] Error sending SSE event:', err);
    }
    return false;
  }
}

/**
 * Sends a message to the active session for the API key, or buffers it if no session is active.
 * Used to prevent data loss during race conditions (e.g. tool execution finishes before client connects).
 */
/**
 * Sends a message to the active session for the API key, or buffers it if no session is active.
 * Used to prevent data loss during race conditions (e.g. tool execution finishes before client connects).
 */
export async function sendMessageOrBuffer(apiKey: string, event: string, data: unknown) {
  const session = await getSessionByApiKey(apiKey);

  if (session && session.isActive) {
    const sent = sendSseEvent(session.controller, event, data);
    if (sent) return;
    // If send failed (e.g. stream closed), fallback to buffer might be risky if session is truly dead,
    // but useful if it's just a transient issue or we want to retry on reconnect.
    // For now, assume if sendSseEvent returns false, the controller is bad.
    // We can buffer it for a potential RECONNECT.
  }

  // Buffer the message
  ensureCleanupRunning();
  const queue = pendingMessages.get(apiKey) || { messages: [], lastUpdated: Date.now() };

  if (queue.messages.length < MAX_PENDING_MSGS) {
    queue.messages.push({ event, data, timestamp: Date.now() });
  } else {
    // Drop oldest
    queue.messages.shift();
    queue.messages.push({ event, data, timestamp: Date.now() });
  }

  queue.lastUpdated = Date.now();
  pendingMessages.set(apiKey, queue);
}
