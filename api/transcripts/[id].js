import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Set CORS headers for external agent access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Valid ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get a specific transcription
      const result = await sql`
        SELECT id, text, timestamp, language, model, is_processed, created_at
        FROM cloud_transcriptions
        WHERE id = ${parseInt(id)}
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Transcription not found' });
      }

      return res.status(200).json({
        success: true,
        transcription: result[0]
      });
    }

    if (req.method === 'PATCH') {
      // Update a transcription (mark as processed)
      const { is_processed } = req.body;

      const result = await sql`
        UPDATE cloud_transcriptions
        SET is_processed = ${is_processed === true}
        WHERE id = ${parseInt(id)}
        RETURNING id, text, timestamp, language, model, is_processed, created_at
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Transcription not found' });
      }

      return res.status(200).json({
        success: true,
        transcription: result[0]
      });
    }

    if (req.method === 'DELETE') {
      // Delete a transcription
      const result = await sql`
        DELETE FROM cloud_transcriptions
        WHERE id = ${parseInt(id)}
        RETURNING id
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'Transcription not found' });
      }

      return res.status(200).json({
        success: true,
        deleted: true
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
