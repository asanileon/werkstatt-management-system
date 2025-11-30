import dbConnect from '../../../lib/dbConnect';
import CompanySettings from '../../../models/CompanySettings';
import { checkAuth } from '../../../middleware/auth';

export default async function handler(req, res) {
  await dbConnect();

  const auth = checkAuth(req);
  if (!auth.authenticated) return res.status(401).json({ error: 'Nicht autorisiert' });

  const user = auth.user;
  if (user.role !== 'manager' && user.role !== 'Manager') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const uid = user.userId;

  if (req.method === 'GET') {
    try {
      let s = await CompanySettings.findOne({ userId: uid });
      
      if (!s) {
        s = await CompanySettings.create({
          userId: uid,
          name: 'Ihre Werkstatt',
          taxRate: 19,
        });
      }

      res.status(200).json({ settings: s });
    } catch (err) {
      console.error('get settings failed:', err);
      res.status(500).json({ error: 'Fehler beim Laden der Einstellungen' });
    }
  } else if (req.method === 'PUT') {
    try {
      const s = await CompanySettings.findOneAndUpdate(
        { userId: uid },
        req.body,
        { new: true, upsert: true, runValidators: true }
      );

      res.status(200).json({ settings: s, message: 'Einstellungen gespeichert' });
    } catch (err) {
      console.error('update settings failed:', err);
      res.status(500).json({ error: 'Fehler beim Speichern der Einstellungen' });
    }
  } else {
    res.status(405).json({ error: 'Methode nicht erlaubt' });
  }
}