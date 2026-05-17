import express from 'express';

interface Session {
  id: string;
  testId: string;
  status: 'waiting' | 'started' | 'completed';
  createdAt: number;
  startedAt?: number;
  durationSeconds: number;
  clients: any[]; // Res objects for SSE
  studentCount: number;
  submissions: any[];
}

const sessions = new Map<string, Session>();

export const assessmentRouter = express.Router();

assessmentRouter.use(express.json());

// Create Session
assessmentRouter.post('/sessions', (req, res) => {
  const { testId, durationSeconds } = req.body;
  const sessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const session: Session = {
    id: sessionId,
    testId,
    status: 'waiting',
    createdAt: Date.now(),
    durationSeconds: durationSeconds || 1200,
    clients: [],
    studentCount: 0,
    submissions: []
  };
  
  sessions.set(sessionId, session);
  res.json({ sessionId });
});

// Join Session
assessmentRouter.post('/sessions/:sessionId/join', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.studentCount++;
  // Notify teacher via a separate mechanism if needed, 
  // but for now we just return the count in poll or status.
  res.json({ status: session.status, testId: session.testId });
});

// Session Status
assessmentRouter.get('/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    id: session.id,
    testId: session.testId,
    status: session.status,
    studentCount: session.studentCount,
    submissionCount: session.submissions.length,
    startedAt: session.startedAt,
    durationSeconds: session.durationSeconds
  });
});

// Start Session
assessmentRouter.post('/sessions/:sessionId/start', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (session.status !== 'waiting') {
    return res.status(400).json({ error: 'Session already started' });
  }
  
  session.status = 'started';
  session.startedAt = Date.now();
  
  // Broadcast to all connected SSE clients
  const payload = JSON.stringify({
    type: 'START',
    startedAt: session.startedAt,
    durationSeconds: session.durationSeconds
  });
  
  session.clients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
  
  res.json({ success: true, startedAt: session.startedAt });
});

// SSE Events
assessmentRouter.get('/sessions/:sessionId/events', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).end();
  }
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  session.clients.push(res);
  
  req.on('close', () => {
    session.clients = session.clients.filter(c => c !== res);
  });
});

// Submit Results
assessmentRouter.post('/sessions/:sessionId/submit', (req, res) => {
  const { sessionId } = req.params;
  const submission = req.body;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  session.submissions.push(submission);
  res.json({ success: true });
});
