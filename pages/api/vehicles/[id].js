import dbConnect from '../../../lib/dbConnect';
import Vehicle from '../../../models/Vehicle';
import { withAuth } from '../../../middleware/auth';

async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'Fahrzeug-ID erforderlich' });

  if (req.method === 'GET') {
    try {
      const v = await Vehicle.findById(id);
      if (!v) return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
      res.status(200).json({ vehicle: v });
    } catch (err) {
      console.error('get failed:', err);
      res.status(500).json({ error: 'Fehler beim Abrufen des Fahrzeugs' });
    }
  } else {
    res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}

export default withAuth(handler);
