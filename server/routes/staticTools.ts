// server/routes/staticTools.ts
import express from 'express';
import path from 'path';

const router = express.Router();

// Serve direttamente la pagina di strumenti Sentry statica
router.get('/sentry-tools', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'sentry-tools.html'));
});

export default router;