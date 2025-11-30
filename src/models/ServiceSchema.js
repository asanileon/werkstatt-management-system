import mongoose from 'mongoose';

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
      default: 80,
    },
    isTuv: {
      type: Boolean,
      default: false,
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

ServiceSchema.virtual('totalCost').get(function () {
  return this.partsCost + this.laborHours * this.laborRate;
});

export default ServiceSchema;
