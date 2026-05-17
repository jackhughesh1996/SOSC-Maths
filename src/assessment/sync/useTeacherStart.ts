import { useState, useEffect } from 'react';

export interface SyncStatus {
  status: 'waiting' | 'started' | 'completed';
  startedAt?: number;
  durationSeconds?: number;
}

export function useTeacherStart(sessionId: string | null) {
  const [data, setData] = useState<SyncStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // First, check current status
    fetch(`/api/sessions/${sessionId}`)
      .then(res => res.json())
      .then(info => {
        setData({
          status: info.status,
          startedAt: info.startedAt,
          durationSeconds: info.durationSeconds
        });
      })
      .catch(err => setError("Failed to connect to session"));

    // Connect to SSE for real-time start
    const eventSource = new EventSource(`/api/sessions/${sessionId}/events`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'START') {
          setData({
            status: 'started',
            startedAt: payload.startedAt,
            durationSeconds: payload.durationSeconds
          });
        }
      } catch (err) {
        console.error("Failed to parse SSE event", err);
      }
    };

    eventSource.onerror = () => {
      setError("Synchronisation lost. Attempting to reconnect...");
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  return { data, error };
}
