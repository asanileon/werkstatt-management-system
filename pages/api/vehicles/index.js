import dbConnect from '../../../lib/dbConnect';
import Vehicle from '../../../models/Vehicle';
import { withAuth } from '../../../middleware/auth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const cars = await Vehicle.find({}).sort({ createdAt: -1 });
      res.status(200).json({ vehicles: cars });
    } catch (err) {
      console.error('get failed:', err);
      res.status(500).json({ error: 'konnte nicht laden' });
    }
  }

  else if (req.method === 'POST') {
    try {
      const v = await Vehicle.create(req.body);
      res.status(201).json({ message: 'Fahrzeug erfolgreich erstellt', vehicle: v });
    } catch (err) {
      console.error('create failed:', err);
      if (err.code === 11000) return res.status(400).json({ error: 'kennzeichen gibts schon' });
      res.status(500).json({ error: 'erstellen fehlgeschlagen' });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: 'id fehlt' });

      const v = await Vehicle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!v) return res.status(404).json({ error: 'auto nicht gefunden' });

      res.status(200).json({ message: 'Fahrzeug erfolgreich aktualisiert', vehicle: v });
    } catch (err) {
      console.error('update failed:', err);
      res.status(500).json({ error: 'update fehlgeschlagen' });
    }
  }

  else if (req.method === 'DELETE') {
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'keine rechte zum löschen' });
    }

    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'id fehlt' });

      const v = await Vehicle.findByIdAndDelete(id);
      if (!v) return res.status(404).json({ error: 'nicht gefunden' });

      res.status(200).json({ message: 'gelöscht' });
    } catch (err) {
      console.error('delete failed:', err);
      res.status(500).json({ error: 'löschen fehlgeschlagen' });
    }
  }

  else {
    res.status(405).json({ error: 'methode nicht erlaubt' });
  }
}

// route mit auth schützen
export default withAuth(handler);
