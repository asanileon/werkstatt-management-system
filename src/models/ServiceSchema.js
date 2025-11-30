import mongoose from 'mongoose';

// Sub-Schema für Service-Einträge
const ServiceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    km: {
      type: Number,
      required: [true, 'Kilometerstand ist erforderlich'],
      min: 0,
    },
    description: {
      type: String,
      required: [true, 'Beschreibung ist erforderlich'],
    },
    partsCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    laborHours: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    laborRate: {
      type: Number,
      default: 80, // Standard Stundensatz
    },
    isTuv: {
      type: Boolean,
      default: false, // Markierung ob es ein TÜV-Service war
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Virtuelle Eigenschaft für Gesamtkosten
ServiceSchema.virtual('totalCost').get(function () {
  return this.partsCost + this.laborHours * this.laborRate;
});

export default ServiceSchema;
