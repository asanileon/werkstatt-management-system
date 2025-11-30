import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email ist erforderlich'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Passwort ist erforderlich'],
      minlength: 6,
      select: false, // Passwort wird standardmäßig nicht zurückgegeben
    },
    role: {
      type: String,
      enum: ['Manager', 'Mechanic'],
      default: 'Mechanic',
    },
    name: {
      type: String,
      required: [true, 'Name ist erforderlich'],
    },
  },
  {
    timestamps: true, // CreatedAt und UpdatedAt automatisch
  }
);

// Passwort hashen vor dem Speichern
UserSchema.pre('save', async function (next) {
  // Nur hashen wenn Passwort geändert wurde
  if (!this.isModified('password')) {
    return next();
  }

  // Passwort mit bcrypt hashen
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Methode zum Passwort-Vergleich
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Model nur einmal erstellen (wichtig für Next.js Hot Reload)
export default mongoose.models.User || mongoose.model('User', UserSchema);
