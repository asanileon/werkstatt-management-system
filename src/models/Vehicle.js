import mongoose from 'mongoose';
import ServiceSchema from './ServiceSchema.js';

const VehicleSchema = new mongoose.Schema(
  {
    licensePlate: {
      type: String,
      required: [true, 'Kennzeichen ist erforderlich'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Besitzername ist erforderlich'],
    },
    ownerPhone: {
      type: String,
    },
    ownerEmail: {
      type: String,
    },
    make: {
      type: String,
      required: [true, 'Hersteller ist erforderlich'],
    },
    model: {
      type: String,
      required: [true, 'Modell ist erforderlich'],
    },
    year: {
      type: Number,
      required: [true, 'Baujahr ist erforderlich'],
    },
    currentKm: {
      type: Number,
      required: [true, 'Aktueller Kilometerstand ist erforderlich'],
      min: 0,
    },
    lastTuvDate: {
      type: Date,
    },
    nextTuvDate: {
      type: Date,
    },
    lastServiceDate: {
      type: Date,
    },
    lastServiceKm: {
      type: Number,
      default: 0,
    },
    serviceHistory: [ServiceSchema],
  },
  {
    timestamps: true,
  }
);

VehicleSchema.index({ licensePlate: 1 });
VehicleSchema.index({ ownerName: 1 });

// tuv warning 1 monat vorher
VehicleSchema.virtual('isTuvDue').get(function () {
  if (!this.nextTuvDate) return false;
  
  const today = new Date();
  const warningDate = new Date(this.nextTuvDate);
  warningDate.setMonth(warningDate.getMonth() - 1);
  
  return today >= warningDate;
});

// service alle 15k km
VehicleSchema.virtual('isServiceDue').get(function () {
  const SERVICE_INTERVAL = 15000;
  
  if (!this.lastServiceKm) return true;
  
  const kmSinceService = this.currentKm - this.lastServiceKm;
  return kmSinceService >= SERVICE_INTERVAL;
});

VehicleSchema.methods.addService = function (serviceData) {
  this.serviceHistory.push(serviceData);
  
  this.currentKm = serviceData.km;
  this.lastServiceDate = serviceData.date;
  this.lastServiceKm = serviceData.km;
  
  // tuv gilt 2 jahre
  if (serviceData.isTuv) {
    this.lastTuvDate = serviceData.date;
    const nextTuv = new Date(serviceData.date);
    nextTuv.setFullYear(nextTuv.getFullYear() + 2);
    this.nextTuvDate = nextTuv;
  }
  
  return this.save();
};

VehicleSchema.set('toJSON', { virtuals: true });
VehicleSchema.set('toObject', { virtuals: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
