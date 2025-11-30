import dbConnect from '../../../../lib/dbConnect';
import Vehicle from '../../../../models/Vehicle';
import { withAuth } from '../../../../middleware/auth';

async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'id fehlt' });

  if (req.method === 'POST') {
    try {
      const data = { ...req.body, performedBy: req.user.userId };
      const v = await Vehicle.findById(id);
      if (!v) return res.status(404).json({ error: 'nicht gefunden' });

      await v.addService(data);
      res.status(200).json({ message: 'service hinzugefügt', vehicle: v });
    } catch (err) {
      console.error('add service failed:', err);
      res.status(500).json({ error: 'hinzufügen fehlgeschlagen' });
    }
  } else {
    res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}

export default withAuth(handler);
