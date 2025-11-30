import dbConnect from '../../../src/lib/dbConnect';
import Vehicle from '../../../src/models/Vehicle';
import { withAuth } from '../../../src/middleware/auth';

async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Fahrzeug-ID erforderlich' });
  }

  // GET - Einzelnes Fahrzeug abrufen
  if (req.method === 'GET') {
    try {
      const vehicle = await Vehicle.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Fahrzeug nicht gefunden' });
      }

      res.status(200).json({ vehicle });
    } catch (error) {
      console.error('Fehler beim Abrufen:', error);
      res.status(500).json({ error: 'Fehler beim Abrufen des Fahrzeugs' });
    }
  }

  else {
    res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}

export default withAuth(handler);
