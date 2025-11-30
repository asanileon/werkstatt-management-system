import mongoose from 'mongoose';

// Verbindungsstatus cachen für serverless Umgebungen
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Bitte MONGODB_URI in .env.local definieren');
}

// Global cached Verbindung für Next.js Hot Reload
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Verbindung zur MongoDB herstellen
async function dbConnect() {
  // Wenn bereits verbunden, direkte Rückgabe
  if (cached.conn) {
    return cached.conn;
  }

  // Neue Verbindung nur wenn keine Promise existiert
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
