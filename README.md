# Werkstatt Management System

Ein modernes Werkstatt-Verwaltungssystem zur Verwaltung von Fahrzeugen, Service-Historie und Kundendaten.

## Features

- 🚗 Fahrzeugverwaltung mit vollständigen Details
- 📝 Service-Historie tracking
- 👥 Benutzer-Management (Mechaniker & Manager)
- 📄 PDF Export für Service-Nachweise
- 🔔 TÜV & Service Erinnerungen
- ⚙️ Firmendaten-Verwaltung für Rechnungen

## Tech Stack

- **Frontend:** Next.js, React, TailwindCSS
- **Backend:** Next.js API Routes
- **Datenbank:** MongoDB mit Mongoose
- **Auth:** JWT
- **PDF:** jsPDF

## Installation

```bash
# dependencies installieren
npm install

# .env datei erstellen und mongodb uri eintragen
MONGODB_URI=deine_mongodb_verbindung
JWT_SECRET=dein_geheimer_schlüssel

# dev server starten
npm run dev
```

## Nutzung

1. Registrieren als Manager oder Mechaniker
2. Firmendaten in Einstellungen eintragen (nur Manager)
3. Fahrzeuge hinzufügen
4. Services dokumentieren
5. PDF Nachweise exportieren

## Lizenz

MIT
