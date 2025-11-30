import dbConnect from '../../../src/lib/dbConnect';
import Vehicle from '../../../src/models/Vehicle';
import { withAuth } from '../../../src/middleware/auth';

async function handler(req, res) {
  await dbConnect();

  // alle autos holen
  if (req.method === 'GET') {
    try {
      const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });
      res.status(200).json({ vehicles });
    } catch (error) {
      console.error('fehler beim laden:', error);
      res.status(500).json({ error: 'konnte nicht laden' });
    }
  }

  // neues auto erstellen
  else if (req.method === 'POST') {
    try {
      const vehicleData = req.body;

      // fahrzeug anlegen
      const vehicle = await Vehicle.create(vehicleData);

      res.status(201).json({
        message: 'Fahrzeug erfolgreich erstellt',
        vehicle,
      });
    } catch (error) {
      console.error('fehler beim erstellen:', error);
      
      // kennzeichen schon vorhanden
      if (error.code === 11000) {
        return res.status(400).json({ error: 'kennzeichen gibts schon' });
      }

      res.status(500).json({ error: 'erstellen fehlgeschlagen' });
    }
  }

  // auto aktualisieren
  else if (req.method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id fehlt' });
      }

      const vehicle = await Vehicle.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!vehicle) {
        return res.status(404).json({ error: 'auto nicht gefunden' });
      }

      res.status(200).json({
        message: 'Fahrzeug erfolgreich aktualisiert',
        vehicle,
      });
    } catch (error) {
      console.error('fehler beim updaten:', error);
      res.status(500).json({ error: 'update fehlgeschlagen' });
    }
  }

  // auto löschen
  else if (req.method === 'DELETE') {
    // nur manager darf löschen
    if (req.user.role !== 'Manager') {
      return res.status(403).json({ error: 'keine rechte zum löschen' });
    }

    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'id fehlt' });
      }

      const vehicle = await Vehicle.findByIdAndDelete(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'nicht gefunden' });
      }

      res.status(200).json({ message: 'gelöscht' });
    } catch (error) {
      console.error('fehler beim löschen:', error);
      res.status(500).json({ error: 'löschen fehlgeschlagen' });
    }
  }

  else {
    res.status(405).json({ error: 'methode nicht erlaubt' });
  }
}

// route mit auth schützen
export default withAuth(handler);
