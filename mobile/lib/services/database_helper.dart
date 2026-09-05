import 'dart:async';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/inspection_model.dart';

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
