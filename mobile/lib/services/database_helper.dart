import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/inspection_model.dart';
import '../models/instrument_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('metrix_lmo.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE inspections (
        id TEXT PRIMARY KEY,
        applicationId TEXT,
        instrumentId TEXT,
        instrumentName TEXT,
        serialNumber TEXT,
        category TEXT,
        ownerName TEXT,
        location TEXT,
        district TEXT,
        scheduledDate TEXT,
        scheduledTime TEXT,
        officer TEXT,
        officerRole TEXT,
        status TEXT,
        gpsCoords TEXT,
        remarks TEXT,
        checklistItems TEXT,
        measurements TEXT,
        photos TEXT,
        certificateNumber TEXT,
        securityHash TEXT,
        isSynced INTEGER,
        updatedAt TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE instruments (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        manufacturer TEXT,
        model TEXT,
        serialNumber TEXT,
        accuracyClass TEXT,
        maxCapacity TEXT,
        minCapacity TEXT,
        verificationScaleInterval TEXT,
        ownerName TEXT,
        tradeName TEXT,
        location TEXT,
        district TEXT,
        certificateId TEXT,
        validUntil TEXT
      )
    ''');

    await _seedInitialData(db);
  }

  Future<void> _seedInitialData(Database db) async {
    final initialInspections = [
      InspectionModel(
        id: 'INSP-2026-0044',
        applicationId: 'APP-2026-0881',
        instrumentId: 'INST-2024-001',
        instrumentName: 'Industrial Pitless Weighbridge (60T)',
        serialNumber: 'WB-60T-2023-8891',
        category: 'Heavy Weighbridge',
        ownerName: 'Apex Logistics & Warehousing Corp',
        location: 'Gate 2 Inward Logistics Bay, Okhla Phase III, New Delhi',
        district: 'South Delhi',
        scheduledDate: '2026-09-02',
        scheduledTime: '11:00 AM',
        officer: 'Inspector Rajesh Sharma',
        officerRole: 'Senior Legal Metrology Officer',
        status: 'SCHEDULED',
        gpsCoords: '28.5284° N, 77.2798° E',
        remarks: 'Scheduled for periodic verification under Schedule VII.',
        checklistItems: [
          ChecklistItem(id: 'c1', label: 'Physical Examination & Plaque Readability', passed: true),
          ChecklistItem(id: 'c2', label: 'Zero-Load Repeatability & Return to Zero', passed: true),
          ChecklistItem(id: 'c3', label: 'Corner / Eccentricity Load Testing', passed: true),
          ChecklistItem(id: 'c4', label: 'Maximum Permissible Error (MPE) Verification', passed: true),
          ChecklistItem(id: 'c5', label: 'Tamper-Proof Lead/Wire Security Stamping', passed: false),
        ],
        measurements: [
          MeasurementItem(testLoad: '10,000 kg', observed: '10,002 kg', mpe: '± 10 kg', result: 'PASS'),
          MeasurementItem(testLoad: '30,000 kg', observed: '29,995 kg', mpe: '± 15 kg', result: 'PASS'),
          MeasurementItem(testLoad: '60,000 kg', observed: '60,010 kg', mpe: '± 20 kg', result: 'PASS'),
        ],
        photos: ['Rating_Plate_WB60.jpg', 'Eccentricity_Load_Check.jpg'],
        isSynced: true,
        updatedAt: DateTime.now().toIso8601String(),
      ),
      InspectionModel(
        id: 'INSP-2026-0048',
        applicationId: 'APP-2026-0895',
        instrumentId: 'INST-2024-004',
        instrumentName: 'Dual Fuel Dispenser (Island A)',
        serialNumber: 'FD-2023-4412',
        category: 'Liquid Fuel Dispenser',
        ownerName: 'Apex Logistics & Warehousing Corp',
        location: 'Fuel Island, Fleet Depot, Connaught Place, New Delhi',
        district: 'Central Delhi',
        scheduledDate: '2026-09-05',
        scheduledTime: '02:30 PM',
        officer: 'Inspector Rajesh Sharma',
        officerRole: 'Senior Legal Metrology Officer',
        status: 'SCHEDULED',
        gpsCoords: '28.6304° N, 77.2177° E',
        remarks: 'Annual verification of 5L and 10L standard volumetric proving.',
        checklistItems: [
          ChecklistItem(id: 'c1', label: 'Totalizer Mechanical & Electronic Plaque Match', passed: true),
          ChecklistItem(id: 'c2', label: 'Nozzle Anti-Drip Valve Seal Check', passed: true),
          ChecklistItem(id: 'c3', label: 'Standard 5L Conical Proving Measure Test', passed: false),
          ChecklistItem(id: 'c4', label: 'Standard 10L Volumetric Delivery Error', passed: false),
          ChecklistItem(id: 'c5', label: 'Pulsar Unit Lead Wire Security Stamping', passed: false),
        ],
        measurements: [
          MeasurementItem(testLoad: '5.000 L', observed: '5.002 L', mpe: '± 0.025 L', result: 'PASS'),
          MeasurementItem(testLoad: '10.000 L', observed: '9.998 L', mpe: '± 0.050 L', result: 'PASS'),
        ],
        photos: ['Fuel_Nozzle_Plate.jpg'],
        isSynced: true,
        updatedAt: DateTime.now().toIso8601String(),
      ),
      InspectionModel(
        id: 'INSP-2026-0038',
        applicationId: 'APP-2026-0799',
        instrumentId: 'INST-2024-003',
        instrumentName: 'Precision Analytical Micro-Balance',
        serialNumber: 'SART-CUBIS-0092',
        category: 'Precision Laboratory Balance',
        ownerName: 'Apex Logistics & Warehousing Corp',
        location: 'Quality Assurance Lab, Bay 3, Okhla, New Delhi',
        district: 'South Delhi',
        scheduledDate: '2026-08-15',
        scheduledTime: '10:00 AM',
        officer: 'Inspector Rajesh Sharma',
        officerRole: 'Senior Legal Metrology Officer',
        status: 'COMPLETED',
        gpsCoords: '28.5301° N, 77.2785° E',
        remarks: 'Verification completed successfully. Calibration within ± 0.0002 g. Issued certificate LM-DEL-2026-00114.',
        checklistItems: [
          ChecklistItem(id: 'c1', label: 'Physical Examination & Plaque Readability', passed: true),
          ChecklistItem(id: 'c2', label: 'Zero-Load Repeatability & Return to Zero', passed: true),
          ChecklistItem(id: 'c3', label: 'Corner / Eccentricity Load Testing', passed: true),
          ChecklistItem(id: 'c4', label: 'Maximum Permissible Error (MPE) Verification', passed: true),
          ChecklistItem(id: 'c5', label: 'Tamper-Proof Lead/Wire Security Stamping', passed: true),
        ],
        measurements: [
          MeasurementItem(testLoad: '10.0000 g', observed: '10.0001 g', mpe: '± 0.0002 g', result: 'PASS'),
          MeasurementItem(testLoad: '50.0000 g', observed: '49.9999 g', mpe: '± 0.0005 g', result: 'PASS'),
          MeasurementItem(testLoad: '220.0000 g', observed: '220.0002 g', mpe: '± 0.0010 g', result: 'PASS'),
        ],
        photos: ['Lab_Balance_Sealed.jpg'],
        certificateNumber: 'LM-DEL-2026-00114',
        securityHash: '8f7a6b2c4e1d9f3a5b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
        isSynced: true,
        updatedAt: '2026-08-15T11:45:00Z',
      ),
    ];

    for (var insp in initialInspections) {
      await db.insert('inspections', insp.toMap());
    }
  }

  Future<List<InspectionModel>> getAllInspections() async {
    final db = await instance.database;
    final maps = await db.query('inspections', orderBy: 'scheduledDate DESC');
    return maps.map((e) => InspectionModel.fromMap(e)).toList();
  }

  Future<InspectionModel?> getInspectionById(String id) async {
    final db = await instance.database;
    final maps = await db.query('inspections', where: 'id = ?', whereArgs: [id]);
    if (maps.isNotEmpty) {
      return InspectionModel.fromMap(maps.first);
    }
    return null;
  }

  Future<int> insertInspection(InspectionModel inspection) async {
    final db = await instance.database;
    return await db.insert('inspections', inspection.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<int> updateInspection(InspectionModel inspection) async {
    final db = await instance.database;
    return await db.update(
      'inspections',
      inspection.toMap(),
      where: 'id = ?',
      whereArgs: [inspection.id],
    );
  }

  Future<List<InspectionModel>> getUnsyncedInspections() async {
    final db = await instance.database;
    final maps = await db.query('inspections', where: 'isSynced = ?', whereArgs: [0]);
    return maps.map((e) => InspectionModel.fromMap(e)).toList();
  }

  Future<int> markAsSynced(String id) async {
    final db = await instance.database;
    return await db.update(
      'inspections',
      {'isSynced': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }
}
