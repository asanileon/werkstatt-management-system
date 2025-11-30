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

    const { email, password, name, role } = req.body;

    // checken ob alles da ist
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'alle felder nötig' });
    }

    // gibts die email schon?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'email gibts schon' });
    }

    // user anlegen
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'Mechanic',
    });

    // token erstellen
    const token = generateToken(user._id, user.email, user.role);

    // alles gut
    res.status(201).json({
      message: 'Registrierung erfolgreich',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('registrierung fehlgeschlagen:', error);
    res.status(500).json({ error: 'server fehler' });
  }
}
