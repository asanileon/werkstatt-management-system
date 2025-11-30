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
    serviceHistory: [ServiceSchema], // Array von Service-Einträgen
  },
  {
    timestamps: true,
  }
);

// Index für schnellere Suche
VehicleSchema.index({ licensePlate: 1 });
VehicleSchema.index({ ownerName: 1 });

// Virtuelle Eigenschaft: TÜV Status prüfen
VehicleSchema.virtual('isTuvDue').get(function () {
  if (!this.nextTuvDate) return false;
  
  const today = new Date();
  const warningDate = new Date(this.nextTuvDate);
  warningDate.setMonth(warningDate.getMonth() - 1); // 1 Monat vorher warnen
  
  return today >= warningDate;
});

// Virtuelle Eigenschaft: Service Status prüfen
VehicleSchema.virtual('isServiceDue').get(function () {
  const SERVICE_INTERVAL = 15000; // Alle 15.000 km Service
  
  if (!this.lastServiceKm) return true;
  
  const kmSinceService = this.currentKm - this.lastServiceKm;
  return kmSinceService >= SERVICE_INTERVAL;
});

// Methode: Service hinzufügen
VehicleSchema.methods.addService = function (serviceData) {
  this.serviceHistory.push(serviceData);
  
  // Aktualisiere Fahrzeugdaten
  this.currentKm = serviceData.km;
  this.lastServiceDate = serviceData.date;
  this.lastServiceKm = serviceData.km;
  
  // Wenn TÜV durchgeführt wurde
  if (serviceData.isTuv) {
    this.lastTuvDate = serviceData.date;
    const nextTuv = new Date(serviceData.date);
    nextTuv.setFullYear(nextTuv.getFullYear() + 2); // TÜV alle 2 Jahre
    this.nextTuvDate = nextTuv;
  }
  
  return this.save();
};

// Sicherstellen dass virtuelle Felder in JSON enthalten sind
VehicleSchema.set('toJSON', { virtuals: true });
VehicleSchema.set('toObject', { virtuals: true });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
