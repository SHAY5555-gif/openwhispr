import { neon } from '@neondatabase/serverless';

// Initialize database connection lazily
let sql;

function getDb() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

// Create table if not exists (runs on first request)
async function ensureTable() {
  const db = getDb();
  await db`
    CREATE TABLE IF NOT EXISTS cloud_transcriptions (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      language VARCHAR(10),
      model VARCHAR(100),
      is_processed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export default async function handler(req, res) {
  // Set CORS headers for external agent access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await ensureTable();
    const db = getDb();

    if (req.method === 'POST') {
      // Save a new transcription
      const { text, language, model } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const result = await db`
        INSERT INTO cloud_transcriptions (text, language, model)
        VALUES (${text}, ${language || null}, ${model || null})
        RETURNING id, text, timestamp, language, model, is_processed, created_at
      `;

      return res.status(201).json({
        success: true,
        transcription: result[0]
      });
    }

    if (req.method === 'GET') {
      // Retrieve transcriptions for external agent
      const { limit = '100', since, until, unprocessed_only } = req.query;
      const limitNum = Math.min(parseInt(limit) || 100, 1000);

      let result;

      if (since && until && unprocessed_only === 'true') {
        result = await db`
          SELECT id, text, timestamp, language, model, is_processed, created_at
          FROM cloud_transcriptions
          WHERE timestamp >= ${new Date(since).toISOString()}
            AND timestamp <= ${new Date(until).toISOString()}
            AND is_processed = FALSE
          ORDER BY timestamp DESC
          LIMIT ${limitNum}
        `;
      } else if (since && until) {
        result = await db`
          SELECT id, text, timestamp, language, model, is_processed, created_at
          FROM cloud_transcriptions
          WHERE timestamp >= ${new Date(since).toISOString()}
            AND timestamp <= ${new Date(until).toISOString()}
          ORDER BY timestamp DESC
          LIMIT ${limitNum}
        `;
      } else if (since && unprocessed_only === 'true') {
        result = await db`
          SELECT id, text, timestamp, language, model, is_processed, created_at
          FROM cloud_transcriptions
          WHERE timestamp >= ${new Date(since).toISOString()}
            AND is_processed = FALSE
          ORDER BY timestamp DESC
          LIMIT ${limitNum}
        `;
      } else if (since) {
        result = await db`
          SELECT id, text, timestamp, language, model, is_processed, created_at
          FROM cloud_transcriptions
          WHERE timestamp >= ${new Date(since).toISOString()}
          ORDER BY timestamp DESC
          LIMIT ${limitNum}
        `;
      } else if (unprocessed_only === 'true') {
        result = await db`
          SELECT id, text, timestamp, language, model, is_processed, created_at
          FROM cloud_transcriptions
          WHERE is_processed = FALSE
          ORDER BY timestamp DESC
          LIMIT ${limitNum}
        `;
      } else {
        result = await db`
          SELECT id, text, timestamp, language, model, is_processed, created_at
          FROM cloud_transcriptions
          ORDER BY timestamp DESC
          LIMIT ${limitNum}
        `;
      }

      return res.status(200).json({
        success: true,
        count: result.length,
        transcriptions: result
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
