import dbConnect from '../../../src/lib/dbConnect';
import CompanySettings from '../../../src/models/CompanySettings';
import { checkAuth } from '../../../src/middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Verify authentication
  const authResult = checkAuth(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ error: 'Nicht autorisiert' });
  }

  const user = authResult.user;

  // Only managers can access settings
  if (user.role !== 'manager' && user.role !== 'Manager') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const userId = user.userId;

  if (req.method === 'GET') {
    try {
      let settings = await CompanySettings.findOne({ userId });
      
      // Erstelle default settings falls nicht vorhanden
      if (!settings) {
        settings = await CompanySettings.create({
          userId,
          name: 'Ihre Werkstatt',
          taxRate: 19,
        });
      }

      res.status(200).json({ settings });
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Fehler beim Laden der Einstellungen' });
    }
  } else if (req.method === 'PUT') {
    try {
      const updateData = req.body;

      let settings = await CompanySettings.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({ settings, message: 'Einstellungen gespeichert' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: 'Fehler beim Speichern der Einstellungen' });
    }
  } else {
    res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}