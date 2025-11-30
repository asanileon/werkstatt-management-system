import dbConnect from '../../../../src/lib/dbConnect';
import Vehicle from '../../../../src/models/Vehicle';
import { withAuth } from '../../../../src/middleware/auth';

async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'id fehlt' });
  }

  // service hinzufügen
  if (req.method === 'POST') {
    try {
      const serviceData = {
        ...req.body,
        performedBy: req.user.userId, // user aus token
      };

      // fahrzeug suchen
      const vehicle = await Vehicle.findById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'nicht gefunden' });
      }

      // service hinzufügen
      await vehicle.addService(serviceData);

      res.status(200).json({
        message: 'service hinzugefügt',
        vehicle,
      });
    } catch (error) {
      console.error('fehler beim hinzufügen:', error);
      res.status(500).json({ error: 'hinzufügen fehlgeschlagen' });
    }
  }

  else {
    res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}

export default withAuth(handler);
