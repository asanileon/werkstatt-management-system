import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
import { generateToken } from '../../../src/utils/jwt';

export default async function handler(req, res) {
  // nur post erlaubt
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  try {
    // db verbindung
    await dbConnect();

    const { email, password } = req.body;

    // prüfen ob alle daten da sind
    if (!email || !password) {
      return res.status(400).json({ error: 'email und passwort fehlen' });
    }

    // user suchen
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ error: 'falsche email oder passwort' });
    }

    // passwort checken
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'falsche email oder passwort' });
    }

    // token erstellen
    const token = generateToken(user._id, user.email, user.role);

    // alles ok
    res.status(200).json({
      message: 'Login erfolgreich',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('fehler beim login:', error);
    res.status(500).json({ error: 'server fehler' });
  }
}
