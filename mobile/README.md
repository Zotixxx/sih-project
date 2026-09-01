# MetriX Mobile — LMO Field Verification Android & iOS App

**Domain:** Legal Metrology Enforcement & Verification  
**Platform:** Flutter + Dart (Android & iOS)  
**Target User:** Legal Metrology Officers (LMO) in the Field  
**Core Features:** Offline-First SQLite, MPE Calculation Engine, Camera & GPS Geotagging, Sync Manager.

---

## 📱 Features

1. **LMO Authentication & Profile:** Secure departmental badge login with PIN authentication.
2. **Assigned Inspections Itinerary:** View and search daily assigned inspections across assigned districts (South Delhi, Central Delhi, etc.).
3. **Statutory 5-Tab Inspection Workspace:**
   * **Tab 1 — Specs:** Technical instrument specifications (S/N, capacity, interval $e$, accuracy class, registered owner).
   * **Tab 2 — Checklist:** Statutory verification checklist under Legal Metrology Rules 2011 (plaque check, repeatability, zero return, eccentricity).
   * **Tab 3 — Test Loads:** Enter standard mass loads and observed scale readings with automated MPE tolerance checking ($\pm 5\text{ g}$, $\pm 10\text{ kg}$).
   * **Tab 4 — Photos & GPS:** Camera photo evidence capture of serial plates and lead seals + live GPS geotag stamp.
   * **Tab 5 — Certification:** Approval action that generates a digital certificate, SHA-256 integrity checksum, and SVG QR code.
4. **Offline SQLite Database:** Local database using `sqflite` allowing LMOs to perform inspections in remote basements, fuel stations, or rural warehouses without network coverage.
5. **Sync Manager:** Background/manual synchronization queue syncing offline records with central MetriX backend when network is restored.

---

## 🚀 Getting Started

### Prerequisites
* Flutter SDK (3.0.0 or higher)
* Android SDK (API level 21+) / Android Studio or VS Code

### Run on Device or Emulator:
```bash
cd mobile
flutter pub get
flutter run
```
