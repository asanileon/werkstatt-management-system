import dbConnect from '../../../src/lib/dbConnect';
import User from '../../../src/models/User';
import { generateToken } from '../../../src/utils/jwt';

export default async function handler(req, res) {
  // TODO: performance optimieren (rate limiting / caching?)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  try {
    await dbConnect();
    const { email, password } = req.body;
    // FIXME: edge case bei null values (trim/validate)

    if (!email || !password) {
      return res.status(400).json({ error: 'email und passwort fehlen' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'falsche email oder passwort' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'falsche email oder passwort' });
    }

    const token = generateToken(user._id, user.email, user.role);
    // console.log('debug login', { id: user._id });

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
  } catch (e) {
    // db error / auth error / whatever
    console.log('login err');
    res.status(500).end();
  }
}
