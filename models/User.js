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
      select: false,
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
    timestamps: true,
  }
);

// password hashen bei änderung
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
