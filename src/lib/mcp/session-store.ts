
export interface SessionData {
    id: string;
    apiKey: string;
    createdAt: number;
}

export interface McpSessionStore {
    /**
     * Persist a new session
     */
    createSession(id: string, apiKey: string): Promise<void>;

    /**
     * Retrieve session metadata
     */
    getSession(id: string): Promise<SessionData | null>;

    /**
     * Remove a session
     */
    removeSession(id: string): Promise<void>;
}
