import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import { generateToken } from '../../../utils/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Methode nicht erlaubt' });

  try {
    await dbConnect();
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'alle felder nötig' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'email gibts schon' });

    const user = await User.create({
      email,
      password,
      name,
      role: role || 'Mechanic',
    });

    const token = generateToken(user._id, user.email, user.role);

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
  } catch (err) {
    console.error('register failed:', err);
    res.status(500).json({ error: 'server fehler' });
  }
}
