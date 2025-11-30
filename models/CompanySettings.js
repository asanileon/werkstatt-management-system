import mongoose from 'mongoose';

const CompanySettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: String,
    zipCode: String,
    city: String,
    phone: String,
    email: String,
    website: String,
    bankName: String,
    iban: String,
    bic: String,
    taxId: String,
    vatId: String,
    taxRate: {
      type: Number,
      default: 19,
    },
    invoicePrefix: {
      type: String,
      default: 'R',
    },
    nextInvoiceNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CompanySettings ||
  mongoose.model('CompanySettings', CompanySettingsSchema);